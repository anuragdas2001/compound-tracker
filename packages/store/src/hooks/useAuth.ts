import { useRecoilValue } from "recoil";
import { authAtom } from "../atoms/auth.atom";

export const useAuth = () => {
  return useRecoilValue(authAtom);
};