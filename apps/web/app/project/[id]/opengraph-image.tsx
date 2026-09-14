import { ImageResponse } from "next/og";
import { fetchPublicProjectById } from "@/lib/api/project";
import { loadOgFonts, ogColors } from "@/lib/og";

export const alt = "DDD 프로젝트";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectOpengraphImage({ params }: Props) {
  const { id } = await params;
  const [fonts, project] = await Promise.all([loadOgFonts(), fetchPublicProjectById(id)]);

  const title = project?.title ?? "DDD 프로젝트";
  /* 제목이 길면 두 줄을 넘겨 프레임 밖으로 밀린다. 길이에 따라 자간을 낮춘다. */
  const titleFontSize = title.length > 18 ? 62 : 76;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 88px",
        backgroundColor: ogColors.background,
        backgroundImage: `radial-gradient(120% 90% at 78% 18%, #1d242b 0%, ${ogColors.background} 62%)`,
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 8,
          color: ogColors.accent,
        }}
      >
        DDD PROJECT
      </div>

      <div
        style={{
          display: "flex",
          fontSize: titleFontSize,
          fontWeight: 700,
          color: ogColors.textPrimary,
          marginTop: 34,
          lineHeight: 1.25,
        }}
      >
        {title}
      </div>

      {project ? (
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: ogColors.textSecondary,
            marginTop: 36,
          }}
        >
          {`${project.generation} · ${project.category}`}
        </div>
      ) : null}
    </div>,
    { ...size, fonts },
  );
}
