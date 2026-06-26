import { useSetRecoilState } from "recoil";
import { authAtom } from "../atoms/auth.atom";

export const useSetAuth = () => {
  console.log("useSetAuth called");
  return useSetRecoilState(authAtom);
};