import type {
  StorageUploadFileParams,
  StorageUploadFileCategory,
} from "../generated/dddApi.schemas";

// POST /api/v1/storage/upload - 파일 업로드
export type PostUploadFileParams = StorageUploadFileParams;
export type PostUploadFileResponse = FileUploadDto;

// 엔티티 타입
export type FileUploadCategory = StorageUploadFileCategory;

export interface FileUploadDto {
  url: string;
  key: string;
}
