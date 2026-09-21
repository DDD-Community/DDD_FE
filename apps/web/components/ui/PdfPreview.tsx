"use client";

import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { colors, fontWeights } from "@/constants/tokens";
import { toProxiedPdfUrl } from "@/lib/pdfProxy";

/** `public/pdfjs-wasm/` 에 깔리는 pdf.js wasm 디코더 디렉터리. 파일이 아니라 경로다(끝의 `/` 필수). */
const PDFJS_WASM_URL = "/pdfjs-wasm/";
/** 로드 전 자리를 잡아둘 기본 비율. 발표 자료는 대부분 16:9 라 로드되면 1페이지 실제 비율로 교체된다. */
const DEFAULT_PAGE_RATIO = 16 / 9;
/** 뷰포트에서 이만큼 떨어진 페이지까지만 캔버스를 유지한다(그 밖은 비워 메모리를 돌려준다). */
const PRERENDER_MARGIN = 1200;
/** 고해상도 디스플레이에서 캔버스가 과하게 커지지 않도록 제한한다. */
const MAX_PIXEL_RATIO = 2;
const MAX_CANVAS_WIDTH = 2000;
/** 이 값 미만의 폭 변화는 재렌더하지 않는다(스크롤바 등장 등으로 인한 잔떨림 방지). */
const RESIZE_THRESHOLD = 32;

const Wrapper = styled.div({
  marginTop: "80px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",

  "@media (max-width: 1024px)": { marginTop: "40px" },
  "@media (max-width: 768px)": { marginTop: "20px", gap: "8px" },
});

// 캔버스를 비웠다 다시 그려도 스크롤이 튀지 않도록, 높이는 항상 홀더의 aspectRatio 가 잡는다.
const PageHolder = styled.div<{ ratio: number }>(({ ratio }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: `${ratio}`,
  overflow: "hidden",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "#f1f5f9",
}));

const PageCanvas = styled.canvas({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  display: "block",
});

const StatusBox = styled.div<{ ratio: number }>(({ ratio }) => ({
  width: "100%",
  aspectRatio: `${ratio}`,
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "#f1f5f9",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  color: "#62748e",
  fontSize: "16px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 767px)": { fontSize: "12px" },
}));

const FallbackLink = styled.a({
  color: colors.primary,
  fontWeight: fontWeights.semiBold,
});

type PageProps = {
  doc: PDFDocumentProxy;
  pageNumber: number;
  ratio: number;
  containerWidth: number;
  title: string;
};

const PdfPage = ({ doc, pageNumber, ratio, containerWidth, title }: PageProps) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [ownRatio, setOwnRatio] = useState<number | null>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: `${PRERENDER_MARGIN}px 0px` },
    );
    observer.observe(holder);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isNearViewport || containerWidth === 0) {
      // 페이지 수가 많은 발표 자료는 캔버스를 전부 들고 있으면 수백 MB 가 된다.
      // 뷰포트에서 멀어지면 백업 스토어를 비우고, 다시 가까워지면 그때 그린다.
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    let renderTask: RenderTask | null = null;
    let cancelled = false;

    const renderPage = async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;

      const base = page.getViewport({ scale: 1 });
      setOwnRatio(base.width / base.height);

      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const targetWidth = Math.min(containerWidth * pixelRatio, MAX_CANVAS_WIDTH);
      const viewport = page.getViewport({ scale: targetWidth / base.width });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      renderTask = page.render({ canvas, viewport });
      await renderTask.promise;
    };

    // 취소(cancel)된 렌더 태스크는 reject 되므로 여기서 흡수한다.
    void renderPage().catch(() => undefined);

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [doc, pageNumber, isNearViewport, containerWidth]);

  return (
    <PageHolder ref={holderRef} ratio={ownRatio ?? ratio}>
      <PageCanvas ref={canvasRef} role="img" aria-label={`${title} ${pageNumber}페이지`} />
    </PageHolder>
  );
};

type Props = {
  src: string;
  title: string;
};

export const PdfPreview = ({ src, title }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pageRatio, setPageRatio] = useState(DEFAULT_PAGE_RATIO);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      setContainerWidth((prev) => (Math.abs(width - prev) >= RESIZE_THRESHOLD ? width : prev));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    const load = async () => {
      setStatus("loading");
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      // wasmUrl 을 주지 않으면 JPEG 2000·JBIG2 이미지를 못 푼다. 그런데 pdf.js 는 이때
      // 실패를 던지지 않고 경고만 남기고 넘어가므로, 슬라이드가 전부 이미지인 발표
      // 자료는 로드도 렌더도 성공한 채 백지로만 보인다. 경로는 sync-pdfjs-wasm.mjs 참고.
      loadingTask = pdfjs.getDocument({ url: toProxiedPdfUrl(src), wasmUrl: PDFJS_WASM_URL });
      const loadedDoc = await loadingTask.promise;
      if (cancelled) return;

      const viewport = (await loadedDoc.getPage(1)).getViewport({ scale: 1 });
      if (cancelled) return;

      setPageRatio(viewport.width / viewport.height);
      setDoc(loadedDoc);
      setStatus("ready");
    };

    load().catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      // loadingTask 를 destroy 하면 진행 중인 네트워크 요청과 워커까지 정리된다.
      void loadingTask?.destroy();
      setDoc(null);
    };
  }, [src]);

  return (
    <Wrapper ref={containerRef}>
      {status === "loading" ? (
        <StatusBox ratio={pageRatio}>PDF 를 불러오는 중입니다…</StatusBox>
      ) : null}
      {status === "error" ? (
        <StatusBox ratio={pageRatio}>
          <span>PDF 미리보기를 불러오지 못했습니다.</span>
          <FallbackLink href={src} target="_blank" rel="noreferrer">
            새 탭에서 열기
          </FallbackLink>
        </StatusBox>
      ) : null}
      {doc
        ? Array.from({ length: doc.numPages }, (_, index) => (
            <PdfPage
              key={index + 1}
              doc={doc}
              pageNumber={index + 1}
              ratio={pageRatio}
              containerWidth={containerWidth}
              title={title}
            />
          ))
        : null}
    </Wrapper>
  );
};
