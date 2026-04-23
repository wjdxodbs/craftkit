/**
 * 바이트 값을 사람이 읽기 쉬운 KB/MB 문자열로 변환한다.
 * 1 MB 이상은 소수점 1자리, 그 미만은 정수 KB.
 */
export function formatByteSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}
