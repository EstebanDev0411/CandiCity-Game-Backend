import { Altura } from "@altura/altura-js";

const API_KEY = "";
const altura = new Altura(API_KEY);

export const getUserCandyBlance = async (colectionAddress: string, tokenID: number, chainID: number) => {
    try {
        const response: { balance: boolean} = await alturaUser.getItems(CHAIN_ID);
        const balance = response.balance;
        return balance;
    } catch(e) {
        throw e;
    }
}