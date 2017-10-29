
import ip from 'ip';

export const DEVELOPMENT_IP = ip.address();
export const DEVELOPMENT_PORT = Math.floor(Math.random() * 65536);
