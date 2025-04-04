/*
 * 모든 API 공통 응답 DTO
 * - result: 0이면 성공
 * - msg: 처리 메시지
 * - data: 응답 데이터 (선택적)
 */
export class CommonResponseDto<T = any> {
  result: number;
  msg: string;
  data?: T;
}
