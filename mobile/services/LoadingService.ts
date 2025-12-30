import { useLoadingStore } from "../store/useLoadingStore";

export class LoadingService {
  show() {
    const showLoading = useLoadingStore.getState().showLoading;
    showLoading();
  }
  hide() {
    const hideLoading = useLoadingStore.getState().hideLoading;
    hideLoading();
  }
}

const loadingService = new LoadingService();

export default loadingService;