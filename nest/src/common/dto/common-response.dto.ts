export class CommonResponseDto<T = any> {
  result: number; // 0: 성공, 그 외는 커스텀
  msg: string;
  data?: T; // ❗️없을 수도 있으므로 optional 처리
}
