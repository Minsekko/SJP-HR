// 유틸리티 함수: undefined를 null로 변환
export function toDbValue(value: any): any {
  return value === undefined ? null : value
}

// 배열의 모든 값을 DB 호환 값으로 변환
export function toDbValues(...values: any[]): any[] {
  return values.map(v => v === undefined ? null : v)
}
