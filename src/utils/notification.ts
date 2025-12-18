export function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("이 브라우저는 알림을 지원하지 않습니다");
        return;
    }

    if (Notification.permission === "granted") {
        console.log("알림 권한이 이미 있습니다");
        return;
    }

    if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                console.log("알림 권한 승인됨");
            }
        });
    }
}

export function sendNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
        new Notification(title, options);
    }
}