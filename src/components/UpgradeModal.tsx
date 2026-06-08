"use client";

import { useMutation } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import { Modal } from "@/components/Modal";
import { apiSend } from "@/lib/api/client";

type UpgradeModalProps = {
  onClose: () => void;
};

type SubscribeResponse = {
  authorization_url: string;
  reference: string;
};

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const subscribe = useMutation({
    mutationFn: () => apiSend<SubscribeResponse>("/api/payments/subscribe", "POST", { plan: "pro" }),
    onSuccess: (data) => {
      window.location.href = data.authorization_url;
    },
  });

  return (
    <Modal title="Upgrade to Pro" onClose={onClose}>
      <div className="grid" style={{ gap: 14 }}>
        <p className="muted" style={{ marginTop: 0 }}>
          This is a Pro feature. Upgrade to unlock job posting, full mentor access, private communities, and unlimited messaging for ₦9,000/month and grow with people who truly get you.
        </p>
        <div className="card" style={{ padding: 18, boxShadow: "none" }}>
          <div className="row">
            <Crown color="#C9A84C" />
            <strong>Professional plan</strong>
          </div>
          <p className="muted">Built for Muslim professionals actively growing their network and visibility.</p>
        </div>
        {subscribe.error ? <p className="muted">Payment could not be started. Please try again.</p> : null}
        <button className="btn btn-primary" disabled={subscribe.isPending} onClick={() => subscribe.mutate()}>
          {subscribe.isPending ? "Opening Paystack..." : "Continue to Paystack"}
        </button>
      </div>
    </Modal>
  );
}
