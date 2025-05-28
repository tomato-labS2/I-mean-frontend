채팅 기능 프론트엔드 연결을 위한 백엔드 정보 (FastAPI 기준)
1. API 기본 URL
기본 주소: http://localhost:8000 (백엔드 FastAPI 서버 주소)

2. 주요 채팅 API 엔드포인트 (HTTP)
채팅방 생성 (Room Creation)
URL: http://localhost:8000/api/rooms
HTTP 메소드: POST
요청 헤더:
- Content-Type: application/json
- Authorization: Bearer <SPRING_AUTH_TOKEN>
 -> Spring에서 발급받은 인증 토큰을 사용합니다. FastAPI 백엔드의 get_current_user 또는 이와 유사한 인증 의존 함수가 이 토큰을 검증할 수 있어야 합니다.

요청 본문 (JSON 형식):
        {
            "room_name": "string",  // 예: "커플 대화방"
            "couple_id": "integer"  // Spring 시스템에서 관리되는 커플 ID
        }
 -> app/api/rooms.py의 RoomCreate 또는 app/main.py의 CreateRoomRequest 모델 참고.

성공 응답 (예시, 상태 코드 200 또는 201):
        {
            "room_id": "integer",       // FastAPI에서 생성된 채팅방 ID
            "room_name": "string",
            "couple_id": "integer",     // 요청 시 보냈던 커플 ID
            "created_at": "datetime_string"
        }
 -> app/api/rooms.py의 RoomResponse 모델 참고. 이 room_id는 웹소켓 연결 시 사용됩니다.

(선택적) 기존 채팅방 목록 조회
만약 사용자가 참여하고 있는 기존 채팅방 목록을 불러오는 API가 있다면 해당 정보를 사용합니다. (현재 제공된 코드에는 명시적인 목록 조회 API가 잘 보이지 않으나, 필요시 백엔드에 추가될 수 있습니다.)
- 예상 URL: http://localhost:8000/api/rooms (GET 방식)
- 요청 헤더: Authorization: Bearer <SPRING_AUTH_TOKEN>

3. 웹소켓 (WebSocket) 엔드포인트
채팅 세션 연결:
URL: ws://localhost:8000/api/sessions/ws/{room_id}?token={SPRING_AUTH_TOKEN}
{room_id}: 위 "채팅방 생성" API 호출 후 받은 FastAPI의 room_id.
{SPRING_AUTH_TOKEN}: Spring에서 발급받은 인증 토큰.

JavaScript 예시 (index.html 참고):
        // currentRoomId는 채팅방 생성 API 응답에서 받은 room_id
        // token은 Spring에서 로그인 후 받은 인증 토큰
        const ws = new WebSocket(`ws://localhost:8000/api/sessions/ws/${currentRoomId}?token=${token}`);

-> 중요: FastAPI 백엔드의 웹소켓 핸들러 (@websocket 데코레이터가 사용된 함수)에서 token 쿼리 파라미터를 통해 사용자를 인증하는 로직이 Spring 토큰을 검증할 수 있도록 구현되어 있어야 합니다. app/api/sessions.py 또는 app/main.py의 웹소켓 관련 코드에서 이 부분을 확인해야 합니다.

웹소켓 메시지 형식 (주고받는 데이터): 이 부분은 이전 답변과 동일하게 유지될 가능성이 높습니다. 백엔드의 메시지 처리 로직에 따라 결정됩니다.
클라이언트 -> 서버 (사용자 메시지 전송):
        {
            "content": "안녕하세요, 오늘 날씨 좋네요!"
        }

클라이언트 -> 서버 (시스템 응답 - 예: AI의 제안에 대한 "네"/"아니오"):
        {
            "type": "response", // 백엔드가 이 타입으로 응답을 구분할 경우
            "content": "네",
            "session_id": "integer" // 현재 진행 중인 세션의 ID (서버가 전달해준 경우)
        }

서버 -> 클라이언트 (수신 메시지 - 다른 사용자 또는 AI):
        {
            // "type" 필드가 없거나 "message" 등으로 올 수 있음
            "content": "네, 정말 화창하네요!",
            "sender_id": "string_or_integer", // 메시지 발신자 ID (선택적)
            "timestamp": "datetime_string"   // 메시지 시간 (선택적)
            // "speaker_type": "A" / "B" / "AI" 등 (app/models/chat.py SpeakerType 참고)
        }

서버 -> 클라이언트 (시스템 메시지 - 예: AI의 질문, 세션 안내 등):
        {
            "type": "system",
            "content": "대화를 계속하시겠습니까?",
            "session_id": "integer" // 관련된 세션 ID (선택적)
        }

서버 -> 클라이언트 (세션 정보 - 연결 성공 시 등):
        {
            "type": "session",
            "session_id": "integer", // FastAPI에서 관리하는 세션 ID
            "content": "채팅 세션에 연결되었습니다."
            // "user_a_id", "user_b_id", "topic" 등 세션 관련 정보 포함 가능 (app/models/chat.py Session 모델 참고)
        }

4. 인증 (Authorization)
토큰: Spring 시스템에서 발급된 JWT 또는 다른 형태의 인증 토큰.

전달 방식:
HTTP API 요청: Authorization: Bearer <SPRING_AUTH_TOKEN> 헤더에 포함.
WebSocket 연결: URL의 쿼리 파라미터 token=<SPRING_AUTH_TOKEN>으로 전달.

백엔드 처리:
FastAPI의 Depends(get_current_user)와 같은 의존성 주입 함수 또는 웹소켓 연결 시 인증 로직이 Spring 토큰을 검증하고 해당 사용자를 식별할 수 있도록 구현되어야 합니다. 이 부분은 FastAPI 백엔드와 Spring 인증 시스템 간의 연동이 핵심입니다.
예를 들어, FastAPI가 Spring의 토큰 검증 API를 호출하거나, 동일한 비밀키 및 알고리즘을 사용하여 JWT를 직접 검증할 수 있습니다.

프론트엔드 개발 시 추가 고려사항:
1. CORS (Cross-Origin Resource Sharing) 설정:
FastAPI 백엔드(main.py)에 프론트엔드 애플리케이션의 도메인 및 포트를 허용하도록 CORS 미들웨어 설정이 필요합니다. (이전 답변의 CORS 설정 예시 참고)

2. 사용자 식별:
웹소켓 연결 시 token 파라미터로 Spring 토큰을 전달하면, FastAPI 백엔드는 이 토큰을 검증하여 어떤 사용자인지 식별해야 합니다. 웹소켓 메시지를 주고받을 때, 누가 보낸 메시지인지 구분하기 위해 이 사용자 식별 정보가 내부적으로 사용됩니다. 프론트엔드가 직접 user_id 같은 것을 웹소켓 URL에 명시적으로 포함할 필요는 없을 수 있으며, 토큰을 통해 백엔드가 처리하는 것이 일반적입니다.

3. 오류 처리 및 사용자 피드백:
API 요청 실패(401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error 등) 및 웹소켓 연결/통신 오류에 대한 견고한 프론트엔드 처리가 중요합니다.

4. 상태 관리:
프론트엔드에서는 현재 채팅방 ID(room_id), 세션 ID(session_id), 수신된 메시지 목록 등을 상태 관리 라이브러리(Redux, Zustand, Vuex 등)나 React Context API 등을 사용하여 효과적으로 관리해야 합니다.

### user 정보
사용자 토큰은 로그인 시, local storage 에 imean_access_token, imean_refresh_token 으로 저장됨.
spring 에서 secret key 가 생성되어있어 동일한 비밀키를 사용하여 JWT 검증 가능.