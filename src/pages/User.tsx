export default function User() {
    return (
        <>
            <div className="flex py-4 space-x-4">
                {/* 왼쪽 상태창 */}
                <div className="flex items-center w-full h-40 p-10 space-x-10 card">
                    <div className="bg-gray-800 border rounded-full h-28 w-28"></div>
                    <div className="flex flex-col space-y-4">
                        <div className="text-3xl font-bold">사용자</div>
                        <div className="">위치
                    </div>
                    </div>
                </div>
                {/* 오른쪽 상태창 */}
                <div className="w-full h-40 card"></div>
            </div>
        </>
    );
}