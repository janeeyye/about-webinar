# Monthly Webinar Static Site

정적 HTML/CSS/JS 기반의 웨비나 페이지입니다.

## 운영 방식
- 디자인/레이아웃은 고정
- 매달 `webinar-events.json`만 교체해서 사용
- 필요하면 `site-config.json`에서 제목/서브카피/푸터 문구 수정

## 파일 설명
- `index.html`: 페이지 구조
- `styles.css`: 스타일
- `main.js`: JSON 로딩 및 카드 렌더링
- `webinar-events.json`: 웨비나 데이터
- `site-config.json`: 상단/하단 문구 설정

## GitHub Pages 배포
이 구조는 build가 필요 없습니다.

### 추천 방식
- GitHub Pages → **Deploy from a branch**
- Branch: `main`
- Folder: `/ (root)`

## JSON 형식
기존 Spark export 형식과 호환되도록 아래 필드를 사용합니다.

```json
[
  {
    "category": "Copilot",
    "difficulty": 3,
    "title": "Getting Started with GitHub Copilot",
    "date": "2026-05-01",
    "time": "14:00",
    "description": "...",
    "targetAudience": ["IT 실무자"],
    "registrationUrl": "https://example.com",
    "hashtags": "#AI #copilot",
    "id": "event-1"
  }
]
```
