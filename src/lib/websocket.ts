const WEBSOCKET_URL = 'ws://localhost:8000/api/sessions/ws';

let socket: WebSocket | null = null;
let currentSessionId: number | undefined = undefined; // 현재 세션 ID 저장

// 시스템 프롬프트 발생 시 UI에 알리고 사용자 응답을 받을 콜백 타입
export type SystemPromptCallback = (message: string, sessionId: number | undefined) => void;

// WebSocketMessage 인터페이스를 export하여 외부에서 타입 참조 가능하도록 수정
export interface WebSocketMessage {
  type: string;
  content: any;
  user_id?: string;
  timestamp?: string;
  session_id?: number;
  topic?: string;
}

// onSystemPrompt 콜백을 인자로 추가
export const connectWebSocket = (
  roomId: string | number,
  onSystemPrompt?: SystemPromptCallback, // 시스템 프롬프트 콜백 함수
  onMessageReceived?: (message: WebSocketMessage) => void, // 일반 메시지 수신 콜백
  onSessionUpdate?: (message: WebSocketMessage) => void // 세션 업데이트 콜백
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('imean_access_token');
    if (!token) {
      console.error('JWT token not found in localStorage.');
      reject(new Error('JWT token not found'));
      return;
    }

    const url = `${WEBSOCKET_URL}/${roomId}?token=${token}`;
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      currentSessionId = undefined; // 연결 시 세션 ID 초기화
      resolve();
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data as string);
        console.log('Received message:', message);
        handleIncomingMessage(message, onSystemPrompt, onMessageReceived, onSessionUpdate);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      socket = null;
      currentSessionId = undefined;
      // TODO: Implement reconnection logic if needed
    };
  });
};

// sendMessage 함수는 type: 'response'일 경우 현재 sessionId를 포함하도록 수정
export const sendWebSocketMessage = (type: string, content: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const messagePayload: Partial<WebSocketMessage> = { type, content };
    if (type === 'response' && currentSessionId !== undefined) {
      messagePayload.session_id = currentSessionId;
    }
    socket.send(JSON.stringify(messagePayload));
    console.log('Sent message:', messagePayload);
  } else {
    console.error('WebSocket is not connected or not open.');
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
  currentSessionId = undefined;
};

const handleIncomingMessage = (
  message: WebSocketMessage,
  onSystemPrompt?: SystemPromptCallback,
  onMessageReceived?: (message: WebSocketMessage) => void,
  onSessionUpdate?: (message: WebSocketMessage) => void
) => {
  if (message.session_id) {
    currentSessionId = message.session_id;
  }

  switch (message.type) {
    case 'message':
      onMessageReceived?.(message);
      break;
    case 'system':
      if (message.content?.includes('계속하시겠습니까?') && onSystemPrompt) {
        onSystemPrompt(message.content, currentSessionId);
      } else {
        onMessageReceived?.(message);
      }
      break;
    case 'session':
      onSessionUpdate?.(message);
      break;
    default:
      console.warn('Unhandled message type:', message.type);
      onMessageReceived?.(message);
  }
};

// Example usage comment (simplified to avoid linter issues)
/*
  To use this module:
  1. Import connectWebSocket, sendWebSocketMessage, closeWebSocket.
  2. Call connectWebSocket(roomId, handleSystemPrompt, handleMessageReceived, handleSessionUpdate) in your component (e.g., useEffect).
     - handleSystemPrompt: (message: string, sessionId: number | undefined) => void;
     - handleMessageReceived: (message: WebSocketMessage) => void;
     - handleSessionUpdate: (message: WebSocketMessage) => void;
  3. Use sendWebSocketMessage('type', payload) to send messages.
  4. Call closeWebSocket when the component unmounts or connection is no longer needed.

  Example for handling system prompts in a React component:

  const [prompt, setPrompt] = useState(null);

  const handleSysPrompt = (msg, sessionId) => {
    setPrompt({ msg, sessionId });
  };

  // In connectWebSocket call:
  // connectWebSocket(roomId, handleSysPrompt, ...);

  // In your JSX:
  // if (prompt) { ... UI to ask user ... sendWebSocketMessage('response', ...) ... setPrompt(null) ... }
*/ 