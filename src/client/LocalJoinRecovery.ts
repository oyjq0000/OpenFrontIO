import { GameStartingModal } from "./GameStartingModal";
import { menuChromeIsTornDown, restoreMenuChrome } from "./MenuChrome";

export const LOCAL_JOIN_FAILED_MESSAGE =
  "Failed to start local game. Please try again.";

export function recoverLocalJoinUi(error: unknown): void {
  console.error("Failed to start local game", error);

  const startingModal = document.querySelector("game-starting-modal");
  if (startingModal instanceof GameStartingModal) {
    startingModal.hide();
  }

  if (menuChromeIsTornDown()) {
    restoreMenuChrome();
    document.dispatchEvent(new CustomEvent("menu-restored"));
  }
  try {
    history.replaceState(null, "", "/");
  } catch (historyError) {
    console.warn("Failed to restore local home URL", historyError);
  }

  window.showPage?.("page-play");
  window.dispatchEvent(
    new CustomEvent("show-message", {
      detail: {
        message: LOCAL_JOIN_FAILED_MESSAGE,
        color: "red",
        duration: 5000,
      },
    }),
  );
}
