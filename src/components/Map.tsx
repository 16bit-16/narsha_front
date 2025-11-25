import { useEffect, useState } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

interface MapSelectInfo {
    lat: number;
    lng: number;
    address: string;
}

interface KakaoMapProps {
    onSelect: (info: MapSelectInfo) => void;
    center?: { lat: number; lng: number };
    marker?: { lat: number; lng: number };
}

export default function KakaoMap({ onSelect }: KakaoMapProps) {
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
    const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const [loaded, setLoaded] = useState(false);

    // Kakao SDK 로드
    useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAOMAP_KEY!,
        libraries: ["services"],
    });

    // kakao 객체 polling
    useEffect(() => {
        const timer = setInterval(() => {
            if (window.kakao && window.kakao.maps) {
                setLoaded(true);
                clearInterval(timer);
            }
        }, 100);

        return () => clearInterval(timer);
    }, []);

    // 📌 현재 위치 가져와서 마커 찍기
    useEffect(() => {
        if (!loaded) return;
        if (!navigator.geolocation) return;
    
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
    
                // 지도 중심만 내 위치로 이동
                setCenter({ lat, lng });
    
                // ⚠️ 여기서 onSelect 호출 제거
                // setMarker({ lat, lng });
            },
            () => {
                console.warn("현재 위치를 가져올 수 없음.");
            }
        );
    }, [loaded]);    

    // 지도 클릭 시 핀 이동 + 주소 갱신
    const handleClick = (_t: any, mouseEvent: kakao.maps.event.MouseEvent) => {
        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();
        setMarker({ lat, lng }); // 클릭한 위치 마커만 표시
    
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].address;
                const address = `${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`;
                onSelect({ lat, lng, address }); // 클릭한 위치 정보 전달
            }
        });
    };
    

    if (!loaded) {
        return (
            <div className="flex items-center justify-center h-96">
                지도를 불러오는 중...
            </div>
        );
    }

    return (
        <Map
            center={center}
            onClick={handleClick}
            className="w-full border rounded-md h-96"
        >
            {marker && <MapMarker position={marker} />}
        </Map>
    );
}
