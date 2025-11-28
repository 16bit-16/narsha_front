// components/Map.tsx

import { useEffect, useState } from "react";
import { Map as KakaoMap, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

interface MapSelectInfo {
    lat: number;
    lng: number;
    address: string;
}

interface KakaoMapProps {
    onSelect: (info: MapSelectInfo) => void;
    center?: { lat: number; lng: number };
    marker?: { lat: number; lng: number };
    readOnly?: boolean; // ✅ 읽기 전용 모드 추가
}

export default function Map({ 
    onSelect, 
    center: propCenter, 
    marker: propMarker,
    readOnly = false // ✅ 기본값 false
}: KakaoMapProps) {
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
    const [center, setCenter] = useState({ lat: 35.8714, lng: 128.6014 });
    const [loaded, setLoaded] = useState(false);

    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAOMAP_KEY!,
        libraries: ["services"],
    });

    useEffect(() => {
        if (!loading && !error) {
            setLoaded(true);
        }
    }, [loading, error]);

    // ✅ props 처리 개선
    useEffect(() => {
        if (propCenter) {
            setCenter(propCenter);
        }
        if (propMarker) {
            setMarker(propMarker);
        }
    }, [propCenter, propMarker]);

    // 현재 위치 가져오기 (편집 모드 + props 없을 때만)
    useEffect(() => {
        if (!loaded || readOnly) return;
        if (propCenter || propMarker) return;
        if (!navigator.geolocation) return;
    
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCenter({ lat, lng });
            },
            (err) => {
                console.warn("현재 위치를 가져올 수 없음");
            }
        );
    }, [loaded, readOnly, propCenter, propMarker]);    

    const handleClick = (_t: any, mouseEvent: kakao.maps.event.MouseEvent) => {
        // ✅ 읽기 전용 모드면 클릭 무시
        if (readOnly) return;

        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();
        setMarker({ lat, lng });
    
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].address;
                const address = `${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`;
                onSelect({ lat, lng, address });
            }
        });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center text-red-500 h-96">
                지도를 불러올 수 없습니다: {error.message}
            </div>
        );
    }

    if (loading || !loaded) {
        return (
            <div className="flex items-center justify-center h-96">
                지도를 불러오는 중...
            </div>
        );
    }

    // ✅ 표시할 마커 결정
    const displayMarker = propMarker || marker;

    return (
        <KakaoMap
            center={center}
            onClick={handleClick}
            className="w-full border rounded-md h-96"
            level={3}
            draggable={true}
            zoomable={true}
        >
            {displayMarker && (
                <MapMarker 
                    position={displayMarker}
                />
            )}
        </KakaoMap>
    );
}