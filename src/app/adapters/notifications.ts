import { toast } from "react-toastify";
import type { NotifierPort } from "../ports/notifications";

export const toastifyNotifier: NotifierPort = {
  error(message, opts) {
    toast.error(message, { toastId: opts?.id });
  },
  success(message, opts) {
    toast.success(message, { toastId: opts?.id });
  },
};
