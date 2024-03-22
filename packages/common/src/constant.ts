import { Network } from "./types";
import { Cluster } from "@solana/web3.js";

export const PORT: number = 8080;
export const WSPORT: number = 8081;
export const SolanaRpcUrl = "https://api.devnet.solana.com";
export const BACKEND_URL = "http://localhost:8080";
export const WS_BACKEND_URL = "http://localhost:8081";
export const HASURA_ADMIN_SERCRET = "myadminsecretkey";
export const REDIS_URL = "redis://localhost:6379";
export const JWT_ALGO = "RS256";

export const AUTH_JWT_PUBLIC_KEY =
  process.env.AUTH_JWT_PUBLIC_KEY ||
  "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqx+7XJxJR+0Lp8hLFKYr5Gc+0RPIdaZJ18GH8b//oMn7PCVe0gLQDkxjvhKo2ySMgWSOSGaNJkZXLhN4jlot/xaulN3dSbrgQPxvx3ALd3nXJaTLOb7xBODd196r+Ylg1QPICdrBQVi6qAXacq/UBK8K7BWQ0TG2/R9aB5mNSGtY3Ogj9xp2MP5LTi7f2Alj6IwSFRN+9SCmH3NiQzNUPBWJB02Lgx1oxwtfevkQ3BpwIqzkOTTE1G7PXgKbYRBUlUNqwvMIjk89tRf/qHgMbRPGYYNu7XoRt8AOVgNFUcL51Gb9vM75XstWoAh6BwYQsceEXUU7dgIJem9zItFRdwIDAQAB-----END PUBLIC KEY-----";

export const AUTH_JWT_PRIVATE_KEY =
  process.env.AUTH_JWT_PRIVATE_KEY ||
  "-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrH7tcnElH7QunyEsUpivkZz7RE8h1pknXwYfxv/+gyfs8JV7SAtAOTGO+EqjbJIyBZI5IZo0mRlcuE3iOWi3/Fq6U3d1JuuBA/G/HcAt3edclpMs5vvEE4N3X3qv5iWDVA8gJ2sFBWLqoBdpyr9QErwrsFZDRMbb9H1oHmY1Ia1jc6CP3GnYw/ktOLt/YCWPojBIVE371IKYfc2JDM1Q8FYkHTYuDHWjHC196+RDcGnAirOQ5NMTUbs9eApthEFSVQ2rC8wiOTz21F/+oeAxtE8Zhg27tehG3wA5WA0VRwvnUZv28zvley1agCHoHBhCxx4RdRTt2Agl6b3Mi0VF3AgMBAAECggEAMom1kN1LOyXDynJ50ghdcCAZyi+YhT5uEn1Cg+AbQ8ZDH3k97rIL9h0TXAAwxD+gC1rCNpmq2AHwH1h6wzfY27w8JRT9FJhPQIINFQ5/JHLkWma36j78+V7bxbQqgBDVezOZsWdcqcrlnVfVMwfAiv2TMTQRR+bxzwGiWho8QoWNq1UcA8GGOE3vzWGrZJbgVwG43xUVDJtMem9w4QwlHLwekP3Q46Lqx1AOtesN39h/HduJtWtYGcw/t2TkIW9UibmBqZy7rkZW+4hCXhGBI6YhAUYnuyP6ZT+r1+J2aPlJeo2yIyjc6YVxoFwUR7QWtINzuBtG9v/YXfmtYCnEIQKBgQDd3E/nX4Vc7xolvoQZzN+0XWnyLqPgtAL63RLFfb8/lhnHHzca2k2eI0+P6I9etDa9c+i4l7/RM5LUkwxd8RGH6S4m8FiUkdKyaiwK1PAGRiUbWaij9WjKVjp7QhEtisQvtyMa9quwpv3C02zbD31/PqgeTmXOH0Aweh162qyeBwKBgQDFdMQ13JCkQe3GNO06EEPE+NjFkLqBVP2leDXmUVZRnHUN4OMpjCb9H0+/4rOAusCRmS9kALoeo6U9ykC5mqUViVzeTqnHXctD4llvEzSngDU/4+cbUQG3obj8JG9lupe/p3r6gRvB13nWiwVzj2wgK2SY0HGG1gaRaIS3K2nVEQKBgQCNhlJ6V9as9+GIHkYKZ0R0u/ovgU0MtAgKmye0T4jGOSvsd58hRAyrSf8g38tFMFSS+fOEfVjhTLLnY35KFtOGDVthf4QiEfuD0HKT3k3W0rws/D61iID2QZdAtV5b3N9VSM/eDWhsYboSo+gWvYTivMdlvcD3gbvisKNJkWD31QKBgCdgIqSPCHUJBK6K7WevyKPl7+xt8RNLbI1rzGvSeoEpzxnmZ8ZoQXomnVOplJwuIaqnPpEVqAfmIFSTGZcppJQH4XIfg7HTHW67G5SP4ucoJPZJr1N+MvZ4lJgLd/90V0CL2HVN+8gK/SvwazThO/GqVZQ3tPvrgEHM8vJIAQHRAoGAEjFMNmitScLogo9Cq5oX88/KpDOfCi+IG19g0HdaepgzreDzallcKf/XnXX9d7wuTuoSRNsq7RfCmLAUlzC+Waw0dpwLkZjgeVvFdrADGOFDKEovesZ0NBQ+Ln0SXJVRaynRxgnrjYINE+1I3uE8XZie4NMh5pybTXBpyx/cIz0=-----END PRIVATE KEY-----";

export const CLIENT_URL = "http://localhost:3000";

export const SALT_ROUNDS = 10;
export const WEB_URL = "http://localhost:3000";
export const isEthereumPublicKey = (value: string): boolean =>
  /^0x[0-9a-fA-F]{40}$/.test(value);
export const isEthereumPrivateKey = (value: string) =>
  /^0x[0-9a-fA-F]{64}$/.test(value);
export const isSolanaAddress = (value: string): boolean =>
  /^[a-zA-Z0-9]{44}$/.test(value);
export const isSolanaPrivateKey = (value: string) =>
  /^[0-9a-fA-F]{64}$/.test(value);
export const isBitcoinPrivateKey = (value: string) =>
  /^[0-9a-fA-F]{64}$/.test(value);
export const isBitcoinPublicKey = (value: string) =>
  /^[0-9a-fA-F]{130}$/.test(value) || /^[0-9a-zA-Z]{27,34}$/.test(value);



export const KAFKA_CLIENT_ID =
  "83f59a2c6bc114d2ed9be33a353fce153f8a73313be585f2ae41fcebe4c8a18b";
export const KAFKA_URL = "localhost:9092";

export const HASURA_URL =
  process.env.HASURA_URL || "http://localhost:8112/v1/graphql";

export const HASURA_ADMIN_SECRET =
  process.env.HAURA_ADMIN_SECRET || "myadminsecret";

export const JWT =
  process.env.AUTH_JWT ||
  "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4ifSwiaWF0IjoxNjY0MjQ3NzE2fQ.RMvnfvZtfhgQvCGj5HeT_4qDk1jjGTVLvO4hXQhxvH1QOU3E4yWv5rqDwhGeH9m2aZh7EiV8s3zQ70XkvPV-TA";

export const AddressSelectFramework = Object.keys(Network).map((key) => ({
  value: Network[key as keyof typeof Network],
  label: key,
}));

export enum EthCluster {
  Mainnet = "mainnet",
  Ropsten = "ropsten",
  Rinkeby = "rinkeby",
  Goerli = "goerli",
  Kovan = "kovan",
  Sepolia = "sepolia",
}

export enum BitcoinCluster {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  REGTEST = 'regtest',
}

export enum USDCCluster {
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  ETHEREUM_ROPSTEN = 'ethereum_ropsten',
  ETHEREUM_RINKEBY = 'ethereum_rinkeby',
  ETHEREUM_TESTNET = 'ethereum_testnet',
  ETHEREUM_LOCAL = 'ethereum_local',
  OTHER = 'other',
}

export enum SolCluster {
  Mainnet = "mainnet",
  Devnet = "devnet",
  Testnet = "testnet",
}

export const SOLSCAN_TXN_URL = (txnId: string, cluster: Cluster): string => {
  return `https://solscan.io/tx/${txnId}?cluster=${cluster}`;
};

export const SOLSCAN_ACCOUNT_URL = (accountId: string): string => {
  return `https://solscan.io/account/${accountId}`;
};

export const ETHERSCAN_TXN_URL = (txnHash: string, network: EthCluster): string => {
  return `https://${network === EthCluster.Mainnet ? '' : (network + '.')}etherscan.io/tx/${txnHash}`;
};

export const ETHERSCAN_ACCOUNT_URL = (address: string, network: EthCluster): string => {
  return `https://${network === EthCluster.Mainnet ? '' : (network + '.')}etherscan.io/address/${address}`;
};

export const BLOCKEXPLORER_TXN_URL = (txnId: string, network: BitcoinCluster): string => {
  return `https://blockexplorer.com/tx/${txnId}`;
};

export const BLOCKEXPLORER_ADDRESS_URL = (address: string, network: BitcoinCluster): string => {
  return `https://blockexplorer.com/address/${address}`;
};


export const USDC_ETHERSCAN_TXN_URL = (txnHash: string, network: string): string => {
  return `https://${network === USDCCluster.ETHEREUM_MAINNET ? '' : (network + '.')}etherscan.io/tx/${txnHash}`;
};

export const USDC_ETHERSCAN_ACCOUNT_URL = (address: string, network: string): string => {
  return `https://${network === USDCCluster.ETHEREUM_MAINNET ? '' : (network + '.')}etherscan.io/address/${address}`;
};


export const getTransactionUrl = (network: Network, txnId: string, cluster: Cluster | EthCluster | BitcoinCluster | USDCCluster | undefined): string => {
  switch (network) {
    case Network.Sol:
      return SOLSCAN_TXN_URL(txnId, cluster as Cluster);
    case Network.Eth:
      return ETHERSCAN_TXN_URL(txnId, cluster as EthCluster);
    case Network.Bitcoin:
      return BLOCKEXPLORER_TXN_URL(txnId, cluster as BitcoinCluster);
    case Network.USDC:
      return USDC_ETHERSCAN_TXN_URL(txnId, cluster as string);
    default:
      return '#';
  }

}

export const getAccountUrl = (network: Network, accountId: string, cluster: Cluster | EthCluster | BitcoinCluster | USDCCluster | undefined): string => {
  switch (network) {
    case Network.Sol:
      return SOLSCAN_ACCOUNT_URL(accountId);
    case Network.Eth:
      return ETHERSCAN_ACCOUNT_URL(accountId, cluster as EthCluster);
    case Network.Bitcoin:
      return BLOCKEXPLORER_ADDRESS_URL(accountId, cluster as BitcoinCluster);
    case Network.USDC:
      return USDC_ETHERSCAN_ACCOUNT_URL(accountId, cluster as string);
    default:
      return '#';
  }

}

export const capitiliaze = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const BTC_WS_URL = "wss://ws.blockchain.info/inv";


export interface ClusterObject {
  value: string;
  label: string;
}

export const enumToClustersArray = (enumObject: any): ClusterObject[] => {
  const clusters: ClusterObject[] = [];
  for (const key in enumObject) {
    if (Object.prototype.hasOwnProperty.call(enumObject, key)) {
      const value = (enumObject as any)[key]; // Type assertion to any
      clusters.push({ value, label: key });
    }
  }
  return clusters;
}

export const secretPhraseRefine = () => {
  return (value: string) => {
    const words = value.split(' ');
    if (words.length === 12 || words.length === 24) {
      return value;
    } else {
      throw new Error('Seed should be either 12 or 24 words');
    }
  };
}

// for 12 word seed
export const SECRET_PHASE_STRENGTH = 256;
export const TOTP_TIME = 120;
export const TOTP_DIGITS = 6;

export const getOtpTemplate = (name: string, otp: number, helpEmail: string) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
  <title>Static Template</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;font-family:'Poppins',sans-serif;background:#ffffff;font-size:14px;">
<div style="max-width:680px;margin:0 auto;padding:45px 30px 60px;background:#f4f7ff;background-image:url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);background-repeat:no-repeat;background-size:800px 452px;background-position:top center;font-size:14px;color:#434343;">
  <header>
    <table style="width:100%;">
      <tbody>
      <tr style="height:0;">
        <td><img alt="" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1663574980688_114990/archisketch-logo" height="30px"/></td>
        <td style="text-align:right;"><span style="font-size:16px;line-height:30px;color:#ffffff;">27 Feb 2024</span></td>
      </tr>
      </tbody>
    </table>
  </header>
  <main>
    <div style="margin:0;margin-top:70px;padding:92px 30px 115px;background:#ffffff;border-radius:30px;text-align:center;">
      <div style="width:100%;max-width:489px;margin:0 auto;">
        <h1 style="margin:0;font-size:24px;font-weight:500;color:#1f1f1f;">PayBox Email Verification</h1>
        <p style="margin:0;margin-top:17px;font-size:16px;font-weight:500;">Hey ${name},</p>
        <p style="margin:0;margin-top:17px;font-weight:500;letter-spacing:0.56px;">Thank you for choosing PayBox. Use the following OTP to complete the procedure to change your email address. OTP is valid for <span style="font-weight:600;color:#1f1f1f;">5 minutes</span>. Do not share this code with others, including PayBox employees.</p>
        <p style="margin:0;margin-top:60px;font-size:40px;font-weight:600;letter-spacing:25px;color:#ba3d4f;">${otp}</p>
      </div>
    </div>
    <p style="max-width:400px;margin:0 auto;margin-top:90px;text-align:center;font-weight:500;color:#8c8c8c;">Need help? Ask at <a href="mailto:${helpEmail}" style="color:#499fb6;text-decoration:none;">${helpEmail}</a> or visit our <a href="" target="_blank" style="color:#499fb6;text-decoration:none;">Help Center</a></p>
  </main>
  <footer style="width:100%;max-width:490px;margin:20px auto 0;text-align:center;border-top:1px solid #e6ebf1;">
    <p style="margin:0;margin-top:40px;font-size:16px;font-weight:600;color:#434343;">PayBox</p>
    <p style="margin:0;margin-top:8px;color:#434343;">F-27, BHP Hostel, IITG, Guwahati, Assam, India</p>
    <div style="margin:0;margin-top:16px;"><a href="" target="_blank" style="display:inline-block;"><img width="36px" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"/></a><a href="" target="_blank" style="display:inline-block;margin-left:8px;"><img width="36px" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"/></a><a href="" target="_blank" style="display:inline-block;margin-left:8px;"><img width="36px" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"/></a><a href="" target="_blank" style="display:inline-block;margin-left:8px;"><img width="36px" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"/></a></div>
    <p style="margin:0;margin-top:16px;color:#434343;">Copyright © PayBox 2024 Company. All rights reserved.</p>
  </footer>
</div>
</body>
</html>
  `
}



export const unixToISOString = (unixTime: number): string => {
  const date = new Date(unixTime * 1000);
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(offset / 60);
  const offsetMinutes = Math.abs(offset) % 60;

  const dateString = date.toISOString().split('T')[0];
  const timeString = date.toTimeString().split(' ')[0];

  const offsetString =
      (offsetHours >= 0 ? '+' : '-') +
      ('0' + Math.abs(offsetHours)).slice(-2) +
      ':' +
      ('0' + offsetMinutes).slice(-2);

  return `${dateString}T${timeString}.${date.getMilliseconds()}${offsetString}`;
}


export enum Process {
  Dev = "dev",
  Prod = "prod",
  Test = "test",
}

export const ACCOUNT_CACHE_EXPIRE = 60 * 60 * 1; // 1 hour  
export const ADDRESS_CACHE_EXPIRE = 60 * 60 * 1; // 1 hour  
export const CLIENT_CACHE_EXPIRE = 60 * 60 * 1; // 1 hour
export const WALLET_CACHE_EXPIRE = 60 * 60 * 1; // 1 hour
export const TRANSACTION_CACHE_EXPIRE = 60 * 60 * 1; // 1 hour
export const PHRASE_ACCOUNT_CACHE_EXPIRE = 60 * 5; // 1 hour
export const OTP_CACHE_EXPIRE = 60 * 5; // 1 hour
export const VALID_CACHE_EXPIRE = 60 * 60 * 10; // 1 hour
export const CHAT_CACHE_EXPIRE = 60 * 1;

export const NOTIF_WORKER_PORT = 8082;