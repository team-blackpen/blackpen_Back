<p align="center">
  <img src="https://private-user-images.githubusercontent.com/102647711/426844359-cd681f01-8c75-4905-87fb-b95b0b6db9d9.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDI5NjMxNTMsIm5iZiI6MTc0Mjk2Mjg1MywicGF0aCI6Ii8xMDI2NDc3MTEvNDI2ODQ0MzU5LWNkNjgxZjAxLThjNzUtNDkwNS04N2ZiLWI5NWIwYjZkYjlkOS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwMzI2JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDMyNlQwNDIwNTNaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hNDY0ZjU4Y2IyNmEzZmUwMjEwMjA4ZTVlNGRjZGQ1ZTc4YThkOTdkODc0NzU5Mzg2MmVkYjZlYTk0MDRmNTI0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.NY6poQFfTNAguGGlJJ9kXMdgJkXhtGND_z5Yvc0W6cc" alt="Jeonhada Banner" width="100%" />
</p>

# 💌 Jeonhada - Backend

**전하다(Jeonhada)** 는 엽서와 사진을 활용해 마음을 담은 편지를 작성하고 전할 수 있도록 돕는 **디지털 편지 서비스**입니다.

누군가에게 직접 말하기 어려운 마음을, 사진과 메시지를 엽서 형태로 담아 전달할 수 있도록 설계되었으며, 익명 전송, 시간 예약, 알림톡 전달 등 감정을 더 섬세하게 전하는 기능들을 제공합니다.

전하다는 단순한 메시지 전송을 넘어, 기억에 남는 감정의 순간을 기록하고 전달하는 경험을 만듭니다.

---

## ✨ 주요 기능

- 카카오 소셜 로그인

  - 카카오 OAuth를 활용한 간편 로그인 기능 제공

- **엽서 기반 디지털 편지 작성 & 전송 API**

  - 사용자는 메시지와 사진을 작성하여 감성적인 편지를 생성하고, 링크를 통해 상대방에게 전달 가능

- 익명/이름 공개, 전달 시간 예약 기능

  - 전송 방식(익명 or 실명)과 열람 시점을 설정할 수 있어, 감정 표현을 더욱 섬세하게 전달 가능

- **카카오 알림톡 실시간 전송**

  - 편지 전송 시 수신자에게 카카오 알림톡으로 즉시 알림을 전송하여, 편지 도착의 감동을 실시간으로 전달

- **사진 업로드 및 개인 이미지 사용 지원**

  - 제공되는 템플릿 외에도 사용자가 직접 선택한 이미지를 엽서 배경으로 활용 가능

- **임시 저장 기능**

  - 편지를 작성 도중 자동으로 임시 저장하여, 중단 후에도 이어서 작성 가능

- 편지 수신 링크 인증 및 열람 처리

  - 수신자는 전달받은 링크로 편지를 열람하며, 시간 지정에 따라 공개 여부가 제어됨

- 받은 편지함 기능
  - 사용자 본인이 받은 편지를 모아보고, 다시 감상할 수 있는 개인 보관 기능 제공

---

## 🧭 서비스 흐름 요약

1. 사용자가 Jeonhada에서 엽서 선택 혹은 사진 첨부 후 편지를 작성
2. 작성된 편지는 전송 설정(익명/이름 공개, 예약 시간 등)에 따라 저장
3. 수신자는 카카오 알림톡을 통해 엽서 형태로 편지를 열람
4. 사용자는 편지 열람 여부를 확인하거나 받은 편지를 보관 가능

---

## 🛠️ 기술 스택

- **Node.js**, **Express**
- **MySQL**
- **Passport.js** (Kakao 소셜 로그인)
- **JWT 인증**
- **PM2** (서버 프로세스 관리)
- **Aligo** (메시징 API 연동)
- **Dayjs**
- **Morgan** (로깅 미들웨어)

---

## 📁 프로젝트 구조

```bash
src/
├── config/ # 환경 변수 및 DB 설정
├── controllers/ # 요청 처리 로직
├── middlewares/ # 인증 및 예외 처리
├── passport/ # 카카오 로그인 전략
├── repositories/ # DB 접근 로직
├── routes/ # API 라우터
├── services/ # 주요 비즈니스 로직
└── app.js # 서버 초기화
```

---

## 🚀 로컬 실행 방법

1. `.env` 파일 생성

```bash
DB_HOST=
DB_PORT=
DB_USER=
DB_PW=
DB_NAME=
KAKAO_ID=
KAKAO_CB_URL=
JWT_SECRET=
```

2. 패키지 설치

```bash
npm install
```

3. 개발용 서버 실행

```bash
npm run dev
```
