// notImplemented.js — 미구현 기능 클릭 시 안내 토스트 (전역)
// 사용: <button onClick={window.notYet}>클릭</button>
//      또는 window.notYet("추가 설명") 로 커스텀 메시지

(function () {
  let toastEl = null;
  let hideTimer = null;

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement("div");
    toastEl.id = "__ni_toast";
    Object.assign(toastEl.style, {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%) translateY(20px)",
      minWidth: "320px",
      maxWidth: "480px",
      background: "linear-gradient(135deg, #1B2A4E 0%, #2C3E68 100%)",
      color: "#fff",
      borderRadius: "12px",
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 16px 40px -10px rgba(15,26,54,.5), 0 0 0 1px rgba(145,166,240,.2)",
      zIndex: "9999",
      fontFamily: "var(--font-sans), 'Pretendard', system-ui, sans-serif",
      fontSize: "13.5px",
      fontWeight: "500",
      lineHeight: "1.5",
      letterSpacing: "-0.01em",
      opacity: "0",
      pointerEvents: "none",
      transition: "opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)",
    });
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function show(message) {
    const el = ensureToast();
    el.innerHTML = `
      <div style="width:34px;height:34px;border-radius:10px;background:#3B5BDB;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">🚧</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11.5px;font-weight:700;color:#91A6F0;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:2px">향후 구현 예정</div>
        <div>${message || "이 기능은 현재 시연 버전에는 포함되어 있지 않아요."}</div>
      </div>
      <button aria-label="close" style="width:26px;height:26px;border-radius:7px;background:rgba(255,255,255,0.1);border:none;color:#C8CFDF;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:inherit">×</button>
    `;
    el.querySelector("button").onclick = hide;

    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(-50%) translateY(0)";
      el.style.pointerEvents = "auto";
    });

    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 3200);
  }

  function hide() {
    if (!toastEl) return;
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(-50%) translateY(20px)";
    toastEl.style.pointerEvents = "none";
  }

  window.notYet = function (message) {
    if (typeof message === "object" && message && "preventDefault" in message) {
      // 이벤트 객체가 넘어온 경우
      message.preventDefault();
      message.stopPropagation();
      message = null;
    }
    show(message);
    return false;
  };
})();
