const form = document.querySelector("#loanForm");
const principalInput = document.querySelector("#principal");
const annualRateInput = document.querySelector("#annualRate");
const yearsInput = document.querySelector("#years");
const monthsInput = document.querySelector("#months");
const monthlyLabel = document.querySelector("#monthlyLabel");
const monthlyPayment = document.querySelector("#monthlyPayment");
const totalInterest = document.querySelector("#totalInterest");
const totalPayment = document.querySelector("#totalPayment");
const notice = document.querySelector("#notice");

const wonFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

function parseMoney(value) {
  return Number(String(value).replace(/[^\d]/g, ""));
}

function formatMoney(value) {
  if (!Number.isFinite(value)) {
    return "0원";
  }

  return wonFormatter.format(Math.max(0, Math.round(value)));
}

function getRepaymentType() {
  return form.querySelector('input[name="repaymentType"]:checked').value;
}

function calculateLoan(principal, annualRate, termMonths, type) {
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    const monthly = principal / termMonths;

    return {
      monthly,
      monthlyLabel: "월 상환금",
      totalInterest: 0,
      totalPayment: principal
    };
  }

  if (type === "equal-principal") {
    const monthlyPrincipal = principal / termMonths;
    let totalInterestAmount = 0;

    for (let month = 0; month < termMonths; month += 1) {
      const remainingPrincipal = principal - monthlyPrincipal * month;
      totalInterestAmount += remainingPrincipal * monthlyRate;
    }

    return {
      monthly: monthlyPrincipal + principal * monthlyRate,
      monthlyLabel: "첫 달 상환금",
      totalInterest: totalInterestAmount,
      totalPayment: principal + totalInterestAmount
    };
  }

  if (type === "bullet") {
    const monthlyInterest = principal * monthlyRate;
    const totalInterestAmount = monthlyInterest * termMonths;

    return {
      monthly: monthlyInterest,
      monthlyLabel: "월 이자",
      totalInterest: totalInterestAmount,
      totalPayment: principal + totalInterestAmount
    };
  }

  const monthly =
    (principal * monthlyRate * (1 + monthlyRate) ** termMonths) /
    ((1 + monthlyRate) ** termMonths - 1);

  return {
    monthly,
    monthlyLabel: "월 상환금",
    totalInterest: monthly * termMonths - principal,
    totalPayment: monthly * termMonths
  };
}

function showError(message) {
  monthlyPayment.textContent = "0원";
  totalInterest.textContent = "0원";
  totalPayment.textContent = "0원";
  notice.textContent = message;
  notice.classList.add("error");
}

function updateResult() {
  const principal = parseMoney(principalInput.value);
  const annualRate = Number(annualRateInput.value);
  const years = Number(yearsInput.value);
  const extraMonths = Number(monthsInput.value);
  const termMonths = years * 12 + extraMonths;

  if (!principal || principal < 1) {
    showError("대출금을 1원 이상 입력해 주세요.");
    return;
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    showError("연이율은 0 이상으로 입력해 주세요.");
    return;
  }

  if (!Number.isFinite(termMonths) || termMonths < 1) {
    showError("상환 기간은 1개월 이상으로 입력해 주세요.");
    return;
  }

  const result = calculateLoan(
    principal,
    annualRate,
    termMonths,
    getRepaymentType()
  );

  monthlyLabel.textContent = result.monthlyLabel;
  monthlyPayment.textContent = formatMoney(result.monthly);
  totalInterest.textContent = formatMoney(result.totalInterest);
  totalPayment.textContent = formatMoney(result.totalPayment);
  notice.textContent = "입력값을 바꾸면 결과가 자동으로 다시 계산됩니다.";
  notice.classList.remove("error");
}

principalInput.addEventListener("input", () => {
  const parsed = parseMoney(principalInput.value);
  principalInput.value = parsed ? new Intl.NumberFormat("ko-KR").format(parsed) : "";
  updateResult();
});

form.addEventListener("input", updateResult);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateResult();
});

updateResult();
