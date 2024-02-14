import QRScanner from "./qrcodeScanner";

export default async function ScanPage() {
    return (
        <div>
            <h1>Scan Page</h1>
            <QRScanner />
        </div>
    );
}