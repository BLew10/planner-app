import React, { useState } from "react";
import styles from "./PaymentDetails.module.scss";
import { usePaymentStore } from "@/store/paymentStore";
import TextInput from "@/app/(components)/form/TextInput";
import SelectInput from "@/app/(components)/form/SelectInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";

enum PaymentDueOptions {
  OnSpecificDay = "OnSpecificDay",
  OnLastDay = "OnLastDay",
}

interface PaymentDetailsProps {
    onNext: () => void
}

const PaymentDetails = ({ onNext }: PaymentDetailsProps) => {
  const paymentStore = usePaymentStore();
  const [paymentDueOption, setPaymentDueOption] = useState(
    PaymentDueOptions.OnSpecificDay
  );

  const handlePaymentDueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedOption = e.target.value;
    if (selectedOption === PaymentDueOptions.OnSpecificDay) {
      paymentStore.updateKeyValue("paymentDueOn", "specificDate"); // Replace "specificDate" with actual value
      paymentStore.updateKeyValue("paymentOnLastDay", false);
    } else {
      paymentStore.updateKeyValue("paymentDueOn", null);
      paymentStore.updateKeyValue("paymentOnLastDay", true);
    }
    setPaymentDueOption(selectedOption as PaymentDueOptions);
  };

  const onSubmit = async () => {
    // TODO: Add validation
    paymentStore.calculateNet();
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
              ${paymentStore.paymentOverview?.totalSale}
            </span>
          </p>
          <form className={styles.form}>
            <TextInput
              name="additionalDiscount1"
              label="Additional Discount"
              type="number"
              subLabel="first option"
              onChange={(e) =>
                paymentStore.updateKeyValue(
                  "additionalDiscount1",
                  e.target.value
                )
              }
              value={
                paymentStore.paymentOverview?.additionalDiscount1?.toString() ||
                ""
              }
            />
            <TextInput
              name="additionalDiscount2"
              label="Additional Discount"
              type="number"
              subLabel="second option"
              onChange={(e) =>
                paymentStore.updateKeyValue(
                  "additionalDiscount2",
                  e.target.value
                )
              }
              value={
                paymentStore.paymentOverview?.additionalDiscount2?.toString() ||
                ""
              }
            />
            <TextInput
              name="additionalSales1"
              label="Additional Sales"
              subLabel="first option"
              onChange={(e) =>
                paymentStore.updateKeyValue("additionalSales1", e.target.value)
              }
              value={
                paymentStore.paymentOverview?.additionalSales1?.toString() || ""
              }
            />
            <TextInput
              name="additionalSales2"
              label="Additional Sales"
              subLabel="second option"
              onChange={(e) =>
                paymentStore.updateKeyValue("additionalSales2", e.target.value)
              }
              value={
                paymentStore.paymentOverview?.additionalSales2?.toString() || ""
              }
            />
            <TextInput
              name="trade"
              label="Trade"
              type="number"
              onChange={(e) =>
                paymentStore.updateKeyValue("trade", e.target.value)
              }
              value={paymentStore.paymentOverview?.trade?.toString() || ""}
            />
            <div className={styles.earlyPaymentDiscount}>
              <TextInput
                name="earlyPaymentDiscount"
                label="Early Payment Discount"
                subLabel="$"
                type="number"
                onChange={(e) => {
                  paymentStore.updateKeyValue(
                    "earlyPaymentDiscount",
                    e.target.value
                  );
                  paymentStore.updateKeyValue(
                    "earlyPaymentDiscountPercent",
                    null
                  );
                }}
                value={
                  paymentStore.paymentOverview?.earlyPaymentDiscount?.toString() ||
                  ""
                }
              />
              <span>or</span>
              <TextInput
                name="earlyPaymentDiscountPercent"
                label="Early Payment Discount Percent"
                subLabel="%"
                type="number"
                onChange={(e) => {
                  paymentStore.updateKeyValue(
                    "earlyPaymentDiscountPercent",
                    e.target.value
                  );
                  paymentStore.updateKeyValue("earlyPaymentDiscount", null);
                }}
                value={
                  paymentStore.paymentOverview?.earlyPaymentDiscountPercent?.toString() ||
                  ""
                }
              />
            </div>
            <div className={styles.amountPrepaid}>
              <TextInput
                name="amountPrepaid"
                type="number"
                label="Amount Prepaid"
                onChange={(e) =>
                  paymentStore.updateKeyValue("amountPrepaid", e.target.value)
                }
                value={
                  paymentStore.paymentOverview?.amountPrepaid?.toString() || ""
                }
              />
              <SelectInput
                name="paymentMethod"
                label="Payment Method"
                onChange={(e) =>
                  paymentStore.updateKeyValue("paymentMethod", e.target.value)
                }
                value={paymentStore.paymentOverview?.paymentMethod || ""}
                options={[
                  { value: "N/A", label: "N/A" },
                  { value: "Cash", label: "Cash" },
                  { value: "Check", label: "Check" },
                  { value: "Credit Card", label: "Credit Card" },
                  { value: "Credit Memo", label: "Credit Memo" },
                ]}
              />

              <TextInput
                name="checkNumber"
                label="Check Number"
                onChange={(e) =>
                  paymentStore.updateKeyValue("checkNumber", e.target.value)
                }
                value={
                  paymentStore.paymentOverview?.checkNumber?.toString() || ""
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
                    paymentStore.updateKeyValue("paymentDueOn", e.target.value);
                    paymentStore.updateKeyValue("paymentOnLastDay", false);
                    setPaymentDueOption(PaymentDueOptions.OnSpecificDay);
                  }}
                  value={
                    paymentStore.paymentOverview?.paymentDueOn?.toString() || ""
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
              <TextInput
                name="lateFee"
                label="Late Fee"
                subLabel="$"
                type="number"
                onChange={(e) => {
                  paymentStore.updateKeyValue("lateFee", e.target.value)
                  paymentStore.updateKeyValue("lateFeePercent", null)
                }
                }
                value={paymentStore.paymentOverview?.lateFee?.toString() || ""}
              />
              <span>or</span>
              <TextInput
                name="lateFeePercent"
                label="Late Fee Percent"
                type="number"
                subLabel="%"
                onChange={(e) => {
                  paymentStore.updateKeyValue("lateFeePercent", e.target.value)
                  paymentStore.updateKeyValue("lateFee", null)
                }
                }
                value={
                  paymentStore.paymentOverview?.lateFeePercent?.toString() || ""
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
