import QRScanner from "./qrcodeScanner";

export default async function ScanPage() {
    return (
        <div className="flex flex-col justify-center items-center w-screen">
            <h1>Scan Page</h1>
            <QRScanner />
        </div>
    );
}