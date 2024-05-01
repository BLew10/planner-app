import React, { useState, useEffect } from "react";
import styles from "./PaymentDetails.module.scss";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import { usePurchasesStore } from "@/store/purchaseStore";
import MoneyInput from "@/app/(components)/form/MoneyInput";
import SelectInput from "@/app/(components)/form/SelectInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";

enum PaymentDueOptions {
  OnSpecificDay = "OnSpecificDay",
  OnLastDay = "OnLastDay",
}

interface PaymentDetailsProps {
  onNext: () => void;
  paymentOverview: Partial<PaymentOverviewModel> | null;
}

const PaymentDetails = ({ onNext, paymentOverview }: PaymentDetailsProps) => {
  const paymentOverviewStore = usePaymentOverviewStore();
  const purchaseStore = usePurchasesStore();
  const [paymentDueOption, setPaymentDueOption] = useState(
    PaymentDueOptions.OnSpecificDay
  );
  useEffect(() => {

    if (paymentOverviewStore.paymentOverview.paymentDueOn) {
      setPaymentDueOption(PaymentDueOptions.OnSpecificDay);
      paymentOverviewStore.updateKeyValue("paymentDueOn", paymentOverviewStore.paymentOverview.paymentDueOn);
    } else {
      setPaymentDueOption(PaymentDueOptions.OnLastDay);
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
      paymentOverviewStore.updateKeyValue("paymentDueOn", null);
    }

    paymentOverviewStore.updateKeyValue("totalSale", purchaseStore.total);
    if (paymentOverview) {
      paymentOverviewStore.updateKeyValue("id", paymentOverview.id);
      paymentOverviewStore.updateKeyValue(
        "additionalDiscount1",
        paymentOverview.additionalDiscount1
      );
      paymentOverviewStore.updateKeyValue(
        "additionalDiscount2",
        paymentOverview.additionalDiscount2
      );
      paymentOverviewStore.updateKeyValue(
        "additionalSales1",
        paymentOverview.additionalSales1
      );
      paymentOverviewStore.updateKeyValue(
        "additionalSales2",
        paymentOverview.additionalSales2
      );
      if (paymentOverview.paymentDueOn) {
        paymentOverviewStore.updateKeyValue("paymentDueOn", paymentOverview.paymentDueOn);
        paymentOverviewStore.updateKeyValue(
          "paymentOnLastDay",
          false
        );
      } else {
        paymentOverviewStore.updateKeyValue("paymentDueOn", null);
        paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
      }
      paymentOverviewStore.updateKeyValue("lateFee", paymentOverview.lateFee);
      paymentOverviewStore.updateKeyValue("lateFeePercent", paymentOverview.lateFeePercent);

      if (paymentOverview.amountPaid) {
        const prePaidPayment = paymentOverview.payments ? paymentOverview.payments[0] : null;
        paymentOverviewStore.updateKeyValue("paymentMethod", prePaidPayment?.paymentMethod);
        paymentOverviewStore.updateKeyValue("checkNumber", prePaidPayment?.checkNumber);
        paymentOverviewStore.updateKeyValue("amountPrepaid", prePaidPayment?.amount);
      }
      paymentOverviewStore.updateKeyValue("deliveryMethod", paymentOverview.deliveryMethod);
      paymentOverviewStore.updateKeyValue("cardType", paymentOverview.cardType);
      paymentOverviewStore.updateKeyValue("cardNumber", paymentOverview.cardNumber);
      paymentOverviewStore.updateKeyValue(
        "cardExpirationDate",
        paymentOverview.cardExpirationDate
      );
      paymentOverviewStore.updateKeyValue(
        "splitPaymentsEqually",
        paymentOverview.splitPaymentsEqually
      );
      console
      paymentOverviewStore.updateKeyValue(
        "scheduledPayments",
        paymentOverview.scheduledPayments
      );
      paymentOverviewStore.updateKeyValue("contactId", paymentOverview.contactId);
      }
  }, []);

  const handlePaymentDueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedOption = e.target.value;
    if (selectedOption === PaymentDueOptions.OnSpecificDay) {
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", false);
    } else {
      paymentOverviewStore.updateKeyValue("paymentDueOn", null);
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
    }
    setPaymentDueOption(selectedOption as PaymentDueOptions);
  };

  const onSubmit = async () => {
    // TODO: Add validation
    paymentOverviewStore.calculateNet();
    onNext();
  };
  return (
    <AnimateWrapper>
      <div className={styles.container}>
        <div className={styles.heading}>
          <p className={styles.subTitle}>
            {" "}
            Total Sale Amount:
            <span className={styles.totalSale}>
              ${Number(paymentOverviewStore.paymentOverview.totalSale).toFixed(2)}
            </span>
          </p>
          <form className={styles.form}>
            <MoneyInput
              name="additionalDiscount1"
              label="Additional Discount"
              subLabel="first option"
              onChange={(e) => {
                e.preventDefault();
                paymentOverviewStore.updateKeyValue(
                  "additionalDiscount1",
                  e.target.value
                );
              }}
              value={
                paymentOverviewStore.paymentOverview?.additionalDiscount1?.toString() ||
                ""
              }
            />
            <MoneyInput
              name="additionalDiscount2"
              label="Additional Discount"
              subLabel="second option"
              onChange={(e) =>
                paymentOverviewStore.updateKeyValue(
                  "additionalDiscount2",
                  e.target.value
                )
              }
              value={
                paymentOverviewStore.paymentOverview?.additionalDiscount2?.toString() ||
                ""
              }
            />
            <MoneyInput
              name="additionalSales1"
              label="Additional Sales"
              subLabel="first option"
              onChange={(e) =>
                paymentOverviewStore.updateKeyValue(
                  "additionalSales1",
                  e.target.value
                )
              }
              value={
                paymentOverviewStore.paymentOverview?.additionalSales1?.toString() ||
                ""
              }
            />
            <MoneyInput
              name="additionalSales2"
              label="Additional Sales"
              subLabel="second option"
              onChange={(e) =>
                paymentOverviewStore.updateKeyValue(
                  "additionalSales2",
                  e.target.value
                )
              }
              value={
                paymentOverviewStore.paymentOverview?.additionalSales2?.toString() ||
                ""
              }
            />
            <MoneyInput
              name="trade"
              label="Trade"
              onChange={(e) =>
                paymentOverviewStore.updateKeyValue("trade", e.target.value)
              }
              value={
                paymentOverviewStore.paymentOverview?.trade?.toString() || ""
              }
            />
            <div className={styles.earlyPaymentDiscount}>
              <MoneyInput
                name="earlyPaymentDiscount"
                label="Early Payment Discount"
                subLabel="$"
                onChange={(e) => {
                  paymentOverviewStore.updateKeyValue(
                    "earlyPaymentDiscount",
                    e.target.value
                  );
                  paymentOverviewStore.updateKeyValue(
                    "earlyPaymentDiscountPercent",
                    null
                  );
                }}
                value={
                  paymentOverviewStore.paymentOverview?.earlyPaymentDiscount?.toString() ||
                  ""
                }
              />
              <span>or</span>
              <MoneyInput
                name="earlyPaymentDiscountPercent"
                label="Early Payment Discount Percent"
                subLabel="%"
                onChange={(e) => {
                  paymentOverviewStore.updateKeyValue(
                    "earlyPaymentDiscountPercent",
                    e.target.value
                  );
                  paymentOverviewStore.updateKeyValue(
                    "earlyPaymentDiscount",
                    null
                  );
                }}
                value={
                  paymentOverviewStore.paymentOverview?.earlyPaymentDiscountPercent?.toString() ||
                  ""
                }
              />
            </div>
            <div className={styles.amountPrepaid}>
              <MoneyInput
                name="amountPrepaid"
                label="Amount Prepaid"
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "amountPrepaid",
                    e.target.value
                  )
                }
                value={
                  paymentOverviewStore.paymentOverview?.amountPrepaid?.toString() ||
                  ""
                }
              />
              <SelectInput
                name="paymentMethod"
                label="Payment Method"
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "paymentMethod",
                    e.target.value
                  )
                }
                value={
                  paymentOverviewStore.paymentOverview?.paymentMethod || ""
                }
                options={[
                  { value: "", label: "N/A" },
                  { value: "Cash", label: "Cash" },
                  { value: "Check", label: "Check" },
                  { value: "Credit Card", label: "Credit Card" },
                  { value: "Credit Memo", label: "Credit Memo" },
                ]}
              />

              <MoneyInput
                name="checkNumber"
                label="Check Number"
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "checkNumber",
                    e.target.value
                  )
                }
                value={
                  paymentOverviewStore.paymentOverview?.checkNumber?.toString() ||
                  ""
                }
              />
            </div>
            <div className={styles.paymentDue}>
              <div className={styles.paymentDueText}>Payment Due</div>
              <div className={styles.dueDate}>
                <input
                  type="radio"
                  name="paymentDue"
                  value={PaymentDueOptions.OnSpecificDay}
                  checked={paymentDueOption === PaymentDueOptions.OnSpecificDay}
                  onChange={handlePaymentDueChange}
                />
                On the
                <SelectInput
                  name="dueDate"
                  label=""
                  options={Array.from({ length: 31 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: (i + 1).toString(),
                  }))}
                  onChange={(e) => {
                    paymentOverviewStore.updateKeyValue(
                      "paymentDueOn",
                      Number(e.target.value)
                    );
                    paymentOverviewStore.updateKeyValue(
                      "paymentOnLastDay",
                      false
                    );
                    setPaymentDueOption(PaymentDueOptions.OnSpecificDay);
                  }}
                  value={
                    paymentOverviewStore.paymentOverview?.paymentDueOn?.toString() ||
                    ""
                  }
                />
              </div>

              <div className={styles.lastDay}>
                <input
                  type="radio"
                  name="paymentDue"
                  value={PaymentDueOptions.OnLastDay}
                  checked={paymentDueOption === PaymentDueOptions.OnLastDay}
                  onChange={handlePaymentDueChange}
                />
                <span>Last Day of Month</span>
              </div>
            </div>
            <div className={styles.lateFee}>
              <MoneyInput
                name="lateFee"
                label="Late Fee"
                subLabel="$"
                onChange={(e) => {
                  paymentOverviewStore.updateKeyValue(
                    "lateFee",
                    e.target.value
                  );
                  paymentOverviewStore.updateKeyValue("lateFeePercent", null);
                }}
                value={
                  paymentOverviewStore.paymentOverview?.lateFee?.toString() ||
                  ""
                }
              />
              <span>or</span>
              <MoneyInput
                name="lateFeePercent"
                label="Late Fee Percent"
                subLabel="%"
                onChange={(e) => {
                  paymentOverviewStore.updateKeyValue(
                    "lateFeePercent",
                    e.target.value
                  );
                  paymentOverviewStore.updateKeyValue("lateFee", null);
                }}
                value={
                  paymentOverviewStore.paymentOverview?.lateFeePercent?.toString() ||
                  ""
                }
              />
            </div>

            <button
              type="button"
              className={styles.submitButton}
              onClick={onSubmit}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </AnimateWrapper>
  );
};

export default PaymentDetails;
