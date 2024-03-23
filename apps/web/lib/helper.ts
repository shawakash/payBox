

export function toBase64(file: File) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		
		fileReader.readAsDataURL(file);
		
		fileReader.onload = () => {
			resolve(fileReader.result);
		};
		
		fileReader.onerror = (error) => {
			reject(error);
		};
	});
}


export function _arrayBufferToBase64( buffer: ArrayBuffer) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}