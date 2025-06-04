"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, Edit3, Heart, User, Settings, LogOut, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { tokenStorage } from "@/features/auth/utils/tokenStorage"
import { BottomNavigation } from "@/features/chat/components/BottomNavigation" // 메인 페이지의 BottomNavigation 사용
import { Header } from "@/components/layout/Header" // 로그인/회원가입 페이지의 Header와 유사한 구조
import { api } from "@/lib/api" // API 호출을 위한 인스턴스
import { useToast } from "@/components/common/Toast"
import { format } from 'date-fns'; // For D-Day calculation

interface UserProfile {
  memberId: number
  memberEmail: string
  memberNickname?: string
  memberNickName?: string
  memberPhone?: string
  profileImageUrl?: string
  coupleId?: number
  coupleStatus: "SINGLE" | "COUPLE" | "PENDING" | "COUPLED"
  memberCreatedAt?: string
}

interface UserProfileApiResponse {
  message: string
  data: UserProfile
  success?: boolean
}

// 새로운 커플 정보 인터페이스
interface MemberSummary {
  memberId: number
  memberCode: string
  memberNickName: string
  memberEmail: string
  memberRole: string
  coupleStatus: string // "SINGLE", "COUPLED"
  coupleId: number | null // API 응답에 따라 null 가능성 있음
  memberCreatedAt: string
}

interface CoupleDetails {
  coupleId: number
  createdAt: string // 커플 생성일 (만난 날로 간주)
  status: string // "ACTIVE", "BLOCKED", "ENDED"
}

interface CoupleInfoData {
  coupleInfo: CoupleDetails
  currentMember: MemberSummary
  partner: MemberSummary
}

interface CoupleInfoApiResponse {
  success: boolean
  message: string
  data: CoupleInfoData | null
}

// BreakCouple API 응답을 위한 인터페이스 (authApi.ts의 AuthApiResponse와 유사할 수 있음)
interface BreakCoupleApiResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    memberInfo?: {
      coupleStatus: "SINGLE" | "COUPLE" | "PENDING";
      coupleId?: number | null;
    };
  };
}

// API 호출 함수 (실제 API 호출로 변경)
const getUserProfile = async (): Promise<UserProfileApiResponse> => {
  console.log("[ProfilePage] Attempting to fetch REAL user profile...");
  try {
    // The actual API might return UserProfile directly inside a 'data' object,
    // or it might be nested further. We assume 'data' contains UserProfile.
    // authApi.getProfile returns a different structure (User),
    // so we use the generic `api.get` here and expect UserProfileApiResponse.
    const response = await api.get<UserProfileApiResponse>("/member/profile");
    console.log("[ProfilePage] REAL getUserProfile response:", response);
    if (!response.data) { // Check if response itself or response.data is the UserProfile
        // If the actual API returns UserProfile directly (not nested in 'data'):
        // return { message: "Profile fetched", data: response as unknown as UserProfile, success: true };
        // For now, sticking to UserProfileApiResponse structure
        throw new Error("User profile data is missing in the response.");
    }
    return response; // Assuming the API returns UserProfileApiResponse structure
  } catch (error) {
    console.error("[ProfilePage] Error fetching real user profile:", error);
    // To match the expected return type, wrap the error in the response structure
    const errorMessage = error instanceof Error ? error.message : "Unknown error fetching profile";
    return { message: errorMessage, data: {} as UserProfile, success: false };
  }
}

const updateUserProfile = async (data: {
  memberEmail?: string
  memberPhone?: string
  // memberNickName?: string; // Nickname update might be separate or not supported
}): Promise<UserProfileApiResponse> => {
  console.log("[ProfilePage] Attempting to update REAL user profile with data:", data);
  try {
    const response = await api.put<UserProfileApiResponse>("/member/update", data); // Endpoint needs to be confirmed
    console.log("[ProfilePage] REAL updateUserProfile response:", response);
    if (!response.data) {
        throw new Error("User profile update data is missing in the response.");
    }
    return response;
  } catch (error) {
    console.error("[ProfilePage] Error updating real user profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error updating profile";
    return { message: errorMessage, data: {} as UserProfile, success: false };
  }
}

const getCoupleInfo = async (): Promise<CoupleInfoApiResponse> => {
  console.log("[ProfilePage] Attempting to fetch REAL couple info...");
  try {
    // Assuming the API returns CoupleInfoApiResponse structure
    const response = await api.get<CoupleInfoApiResponse>("/couple/info");
    console.log("[ProfilePage] REAL getCoupleInfo response:", response);
    // The CoupleInfoApiResponse already defines 'data' as potentially null
    return response;
  } catch (error) {
    console.error("[ProfilePage] Error fetching real couple info:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error fetching couple info";
    return { success: false, message: errorMessage, data: null };
  }
}

const breakCouple = async (): Promise<BreakCoupleApiResponse> => {
  console.log("[ProfilePage] Attempting to REAL break couple...");
  try {
    // Assuming the API returns BreakCoupleApiResponse structure
    const response = await api.delete<BreakCoupleApiResponse>("/couple/break"); // Endpoint needs to be confirmed
    console.log("[ProfilePage] REAL breakCouple response:", response);
    return response;
  } catch (error) {
    console.error("[ProfilePage] Error breaking couple:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error breaking couple";
    return { success: false, message: errorMessage };
  }
};

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth, isLoading: authIsLoading } = useAuth()
  const { showToast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile") // 하단 네비게이션 바 활성 탭

  // 커플 정보 상태
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfoData | null>(null)
  const [isCoupleInfoLoading, setIsCoupleInfoLoading] = useState(false)

  const [isCoupleInfoOpen, setIsCoupleInfoOpen] = useState(false)
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false)

  // 개인정보 수정 관련 상태
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
  const [editableEmail, setEditableEmail] = useState("")
  const [editablePhone, setEditablePhone] = useState("")

  useEffect(() => {
    console.log(
      "[ProfilePage] useEffect triggered. isAuthenticated:", isAuthenticated,
      "authIsLoading:", authIsLoading,
      "user:", JSON.stringify(user)
    );

    const fetchAllData = async () => {
      console.log("[ProfilePage] fetchAllData: Starting to fetch profile data...");
      setIsPageLoading(true); // 페이지 로딩 시작 (프로필 + 커플 정보)
      setProfile(null); // 이전 프로필 정보 초기화
      setCoupleInfo(null); // 이전 커플 정보 초기화

      try {
        const profileResponse = await getUserProfile(); // Now calls real API
        console.log("[ProfilePage] fetchAllData - Profile Response:", profileResponse);

        if (profileResponse && profileResponse.data && profileResponse.success) {
          const userProfile = profileResponse.data;
          setProfile(userProfile);
          // Update editable fields if profile is fetched successfully
          setEditableEmail(userProfile.memberEmail || "");
          setEditablePhone(userProfile.memberPhone || "");
          console.log("[ProfilePage] fetchAllData: Profile data set:", userProfile);

          if ((userProfile.coupleStatus === "COUPLE" || userProfile.coupleStatus === "COUPLED") && userProfile.coupleId) {
            console.log("[ProfilePage] User is in a couple. Fetching couple info for coupleId:", userProfile.coupleId);
            setIsCoupleInfoLoading(true);
            try {
              const coupleResponse = await getCoupleInfo(); // Now calls real API
              console.log("[ProfilePage] fetchAllData - Couple Response:", coupleResponse);
              if (coupleResponse && coupleResponse.success && coupleResponse.data) {
                setCoupleInfo(coupleResponse.data);
                console.log("[ProfilePage] fetchAllData: Couple info set:", coupleResponse.data);
              } else {
                showToast(coupleResponse.message || "커플 정보를 불러오는데 실패했습니다.");
                console.warn("[ProfilePage] fetchAllData: Could not fetch couple info:", coupleResponse.message);
              }
            } catch (coupleError) {
              console.error("[ProfilePage] fetchAllData: Error fetching couple info:", coupleError);
              showToast("커플 정보 로딩 중 오류가 발생했습니다.");
            } finally {
              setIsCoupleInfoLoading(false);
            }
          } else {
             console.log("[ProfilePage] User is not in a couple or no coupleId.");
             setIsCoupleInfoLoading(false); // 커플 아니면 로딩할 필요 없음
          }
        } else {
          showToast(profileResponse.message || "프로필 정보를 불러오는데 실패했습니다.");
          console.warn("[ProfilePage] fetchAllData: Profile fetch failed or data missing:", profileResponse.message);
        }
      } catch (error) {
        console.error("[ProfilePage] fetchAllData: Error fetching profile data:", error);
        showToast("프로필 정보 로딩 중 에러가 발생했습니다.");
      } finally {
        setIsPageLoading(false); // 모든 데이터 요청 시도 후 페이지 로딩 완료
        console.log("[ProfilePage] fetchAllData: All data fetching attempts complete.");
      }
    };

    if (authIsLoading) {
      console.log("[ProfilePage] Authentication is loading. Waiting...");
      setIsPageLoading(true); // 인증 로딩 중에는 페이지 전체 로딩
    } else {
      if (isAuthenticated && user) {
        console.log("[ProfilePage] User is authenticated. Calling fetchAllData.");
        fetchAllData();
      } else {
        console.log("[ProfilePage] User NOT authenticated. Redirecting to login.");
        router.push("/auth/login");
      }
    }
  }, [isAuthenticated, authIsLoading, user, router, showToast, checkAuth]);
  
  // 하단 네비게이션 탭 변경 핸들러
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "home") {
      router.push("/main")
    } else if (tab === "couple-chat") {
      // 커플 채팅 로직 (main page 참고, 필요시 구현)
      const coupleId = tokenStorage.getCoupleId()
      if (!coupleId) {
        showToast("커플 채팅을 시작하려면 먼저 커플을 등록해주세요.")
        // 필요시 커플 등록 페이지로 안내
        return
      }
      // router.push("/chat"); // 또는 채팅 관련 페이지로 이동
      showToast("커플 채팅 기능은 준비 중입니다.")
    } else if (tab === "ai-counseling") {
      showToast("AI 상담 기능은 준비 중입니다.")
    } else if (tab === "profile") {
      // 현재 페이지이므로 아무것도 안 함
    }
  }

  const handleEditProfile = () => {
    // This function seems unused or its purpose needs clarification.
    // For now, personal info editing is handled by handleEditPersonalInfoClick.
    console.log("Edit Profile button clicked - functionality to be defined or integrated with Personal Info edit.");
  }
  
  const handleLogout = async () => {
    try {
      await api.post("/member/logout", {}); // Assuming this is the logout endpoint
      showToast("로그아웃 되었습니다.");
    } catch (e) {
      showToast("로그아웃 중 오류가 발생했습니다.");
    }
    tokenStorage.clear();
    router.push("/auth/login");
  }

  const handleEditPersonalInfoClick = () => {
    if (profile) {
      setEditableEmail(profile.memberEmail || "");
      setEditablePhone(profile.memberPhone || "");
    }
    setIsEditingPersonalInfo(true)
  }

  const handleCancelEditPersonalInfo = () => {
    setIsEditingPersonalInfo(false);
    // 입력 필드 값을 원래 프로필 값으로 되돌릴 필요는 없음 (다음에 수정 시 다시 세팅됨)
  };

  const handleSavePersonalInfo = async () => {
    if (!profile) {
      showToast("프로필 정보가 없어 저장할 수 없습니다.")
      return
    }
    // Basic email validation (optional, can be more robust)
    if (editableEmail && !/\S+@\S+\.\S+/.test(editableEmail)) {
        showToast("유효한 이메일 주소를 입력해주세요.");
        return;
    }
    console.log("[ProfilePage] Saving personal info:", { memberEmail: editableEmail, memberPhone: editablePhone });
    
    const updateData: { memberEmail?: string; memberPhone?: string } = {};
    if (editableEmail !== profile.memberEmail) {
      updateData.memberEmail = editableEmail;
    }
    if (editablePhone !== profile.memberPhone) {
      updateData.memberPhone = editablePhone;
    }

    if (Object.keys(updateData).length === 0) {
      showToast("변경된 내용이 없습니다.");
      setIsEditingPersonalInfo(false);
      return;
    }

    try {
      const response = await updateUserProfile(updateData); // Now calls real API
      if (response.success && response.data) {
        setProfile(prevProfile => ({ ...prevProfile, ...response.data } as UserProfile));
        showToast("개인 정보가 성공적으로 업데이트되었습니다.")
        setIsEditingPersonalInfo(false)
        // Re-fetch all data to ensure consistency, or update specific fields
        // For now, just updating state with response.data
        await checkAuth(); // Re-check auth to update user context if necessary
      } else {
        showToast(response.message || "개인 정보 업데이트에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error saving personal info:", error)
      const errorMessage = error instanceof Error ? error.message : "개인 정보 저장 중 오류 발생";
      showToast(errorMessage);
    }
  }

  const handleBreakCoupleClick = async () => {
    console.log("[ProfilePage] handleBreakCoupleClick - profile:", JSON.stringify(profile));
    console.log("[ProfilePage] handleBreakCoupleClick - profile.coupleStatus:", profile?.coupleStatus);

    if (!profile || (profile.coupleStatus !== "COUPLE" && profile.coupleStatus !== "COUPLED")) {
      showToast("커플 상태가 아니거나 프로필 정보가 없습니다.")
      return
    }

    // 사용자에게 확인 받기 (실제 UI에서는 Modal 등을 사용하는 것이 좋음)
    if (!window.confirm("정말로 커플 관계를 끊으시겠습니까?")) {
      return
    }

    console.log("[ProfilePage] Breaking couple...");
    try {
      const response = await breakCouple(); // Now calls real API
      if (response.success) {
        showToast(response.message || "커플 관계가 해제되었습니다.")
        if (response.data?.memberInfo) {
            setProfile(prev => {
                if (!prev) return null; // Should not happen if logic is correct
                return {
                    ...prev,
                    coupleStatus: response.data!.memberInfo!.coupleStatus,
                    coupleId: response.data!.memberInfo!.coupleId || undefined, // Coerce null to undefined
                };
            });
        } else {
             setProfile(prev => {
                if (!prev) return null;
                return { ...prev, coupleStatus: "SINGLE", coupleId: undefined };
             });
        }
        setCoupleInfo(null); 
        setIsCoupleInfoOpen(false); 
        await checkAuth(); 
      } else {
        showToast(response.message || "커플 해제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error breaking couple:", error)
      const errorMessage = error instanceof Error ? error.message : "커플 해제 중 오류 발생";
      showToast(errorMessage);
    }
  }

  // D-Day 계산 함수
  const calculateDday = (anniversary: string | undefined): string => {
    if (!anniversary) return "-";
    try {
      const meetDate = new Date(anniversary);
      const today = new Date();
      // 시간을 00:00:00으로 설정하여 날짜만 비교
      meetDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const differenceInTime = today.getTime() - meetDate.getTime();
      const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
      
      return `D+${differenceInDays + 1}`; // 만난 날을 D+1로 계산
    } catch (e) {
      console.error("Error calculating D-day:", e);
      return "날짜 계산 오류";
    }
  };

  if (authIsLoading || isPageLoading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>
  }

  if (!isAuthenticated || !profile) {
    // 이미 useEffect에서 router.push를 하지만, 만약을 위한 방어 코드
    // 혹은 로딩이 끝났지만 profile이 없는 경우 (API 실패 등)
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>프로필 정보를 불러오지 못했습니다.</p>
        <Button onClick={() => router.push("/auth/login")} className="mt-4">
          로그인 페이지로 이동
        </Button>
      </div>
    );
  }

  const { memberNickName, memberNickname, memberEmail, profileImageUrl } = profile;
  const displayNickname = memberNickName || memberNickname || "사용자"; // API 응답에 따라 필드명 확인 필요

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F8]"> {/* 페이지 전체 배경색 수정 */}
      {/* 상단 바 - 이전 UI 스타일 복원 */}
      <div className="shadow-sm sticky top-0 z-20" style={{ backgroundColor: '#DCE9E2' }}> {/* 상단 바 배경색 수정 */}
        <div className="flex items-center justify-between px-4 py-3 h-[60px]">
          <Button variant="ghost" size="sm" onClick={() => router.push("/main")} className="text-gray-700">
            <ChevronLeft size={28} />
          </Button>
          <div className="flex-grow flex justify-center">
            <Image src="/images/logo-gr.png" alt="I:mean 로고" width={138} height={36} style={{ objectFit: "contain" }} />
          </div>
          <div className="w-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              title="로그아웃"
              className="!bg-[#f4e6a1] !text-[#5a9b5a] hover:!bg-[#ffe066] hover:!text-[#3c1e1e] shadow-md border border-[#e0e0e0] transition-all duration-200 flex flex-row items-center gap-2 px-4 py-2 rounded-xl min-w-[1px]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-grow p-4 space-y-6">
        <div className="text-center py-6 bg-white shadow rounded-lg">
          <div className="relative w-24 h-24 mx-auto mb-3 flex items-center justify-center">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={displayNickname}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            ) : (
              // SVG Placeholder Icon
              <svg
                className="w-full h-full rounded-full"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="50" fill="#D6D9F0" /> {/* 연한 파랑/보라 배경 */}
                <path
                  d="M50 42C54.4183 42 58 38.4183 58 34C58 29.5817 54.4183 26 50 26C45.5817 26 42 29.5817 42 34C42 38.4183 45.5817 42 50 42ZM50 47C40.075 47 32 53.0333 32 60.5V65H68V60.5C68 53.0333 59.925 47 50 47Z"
                  fill="#A0A7D4" // 아이콘 색상 (배경보다 조금 더 진하게)
                />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{displayNickname}</h1>
          {memberEmail && <p className="text-sm text-gray-500 mt-1">{memberEmail}</p>}
        </div>

        {/* 아코디언 메뉴 */}
        <div className="w-full max-w-md mx-auto space-y-2"> {/* 너비 및 중앙 정렬 조정 */}
          {/* 커플 정보 - 항상 표시되도록 수정 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <button
              onClick={() => setIsCoupleInfoOpen(!isCoupleInfoOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-pink-500" />
                <span>커플 정보</span>
              </div>
              {isCoupleInfoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isCoupleInfoOpen && (
              <div className="p-4 border-t border-gray-200 text-gray-800">
                {profile && (profile.coupleStatus === "COUPLE" || profile.coupleStatus === "COUPLED") ? (
                  isCoupleInfoLoading ? (
                    <p className="text-gray-600">커플 정보 로딩 중...</p>
                  ) : coupleInfo && coupleInfo.coupleInfo && coupleInfo.partner ? (
                    <div className="space-y-3 text-sm">
                      <p><strong>커플 연결일:</strong> {coupleInfo.coupleInfo.createdAt ? format(new Date(coupleInfo.coupleInfo.createdAt), 'yyyy년 MM월 dd일') : '-'}</p>
                      <p><strong>D-Day:</strong> {calculateDday(coupleInfo.coupleInfo.createdAt)}</p>
                      <p><strong>내 애칭:</strong> {coupleInfo.currentMember?.memberNickName || profile.memberNickName || profile.memberNickname || '-'}</p>
                      <p><strong>상대방 애칭:</strong> {coupleInfo.partner.memberNickName || '-'}</p>
                      <Button
                        onClick={handleBreakCoupleClick}
                        variant="outline"
                        className="w-full mt-4 py-1.5 rounded-md transition duration-150 text-xs" 
                      >
                        커플 끊기
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-600">커플 정보를 불러올 수 없습니다. 다시 시도해주세요.</p>
                  )
                ) : profile && (profile.coupleStatus === "SINGLE" || profile.coupleStatus === "PENDING") ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-700 mb-3">커플이 아닙니다. 커플 등록을 하시겠습니까?</p>
                    <Button
                      onClick={() => router.push("/auth/couple-register")}
                      variant="default"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      커플 등록하기
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600">프로필 정보를 확인 중입니다...</p>
                )}
              </div>
            )}
          </div>

          {/* 개인 정보 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <button
              onClick={() => setIsPersonalInfoOpen(!isPersonalInfoOpen)}
              className="w-full flex items-center justify-between p-4 text-left text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center">
                <User size={20} className="mr-3 text-blue-500" />
                <span className="font-medium">개인정보</span>
              </div>
              {isPersonalInfoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isPersonalInfoOpen && (
              <div className="p-4 border-t border-gray-200 space-y-3 text-gray-800">
                {!isEditingPersonalInfo ? (
                  <div className="space-y-3 text-sm">
                    <p><strong>이메일:</strong> {profile.memberEmail || "-"}</p>
                    <p><strong>전화번호:</strong> {profile.memberPhone || "-"}</p>
                    {profile.memberCreatedAt && 
                      <p><strong>가입일:</strong> {format(new Date(profile.memberCreatedAt), 'yyyy년 MM월 dd일')}</p>
                    }
                    <Button
                      onClick={handleEditPersonalInfoClick}
                      variant="ghost"
                      className="p-0 h-auto text-primary hover:underline mt-2 text-sm"
                    >
                      수정하기
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-2">
                      <div>
                        <label htmlFor="email" className="block text-xs font-medium text-gray-700">이메일</label>
                        <input
                          type="email"
                          id="email"
                          value={editableEmail}
                          onChange={(e) => setEditableEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-xs font-medium text-gray-700">전화번호</label>
                        <input
                          type="tel"
                          id="phone"
                          value={editablePhone}
                          onChange={(e) => setEditablePhone(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={handleCancelEditPersonalInfo}>취소</Button>
                      <Button onClick={handleSavePersonalInfo}>저장</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 설정 - 이전 UI에는 별도 로그아웃 버튼이 없었으므로 해당 섹션은 UI상 변경 없음 */}
          {/* 
           <div className="bg-white shadow rounded-lg overflow-hidden">
             <div className="p-4 text-gray-800"> 
               <div className="flex items-center">
                 <Settings size={20} className="mr-3 text-gray-500" /> 
                 <span className="font-medium">설정</span>
               </div>
             </div>
           </div>
          */}

        </div>
      </main>

      {/* 하단 네비게이션 바 - 이전 스타일 유지 */}
      <div className="shadow-sm sticky bottom-0 z-20" style={{ backgroundColor: '#DCE9E2' }}> {/* 하단 바 배경색 수정 */}
        <BottomNavigation activeTab="profile" onTabChange={handleTabChange} />
      </div>
    </div>
  )
} 