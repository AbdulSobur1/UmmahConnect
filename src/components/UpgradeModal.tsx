"use client";

import { Crown } from "lucide-react";
import { Modal } from "@/components/Modal";

type UpgradeModalProps = {
  onClose: () => void;
};

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  return (
    <Modal title="Upgrade to Pro" onClose={onClose}>
      <div className="grid" style={{ gap: 14 }}>
        <p className="muted" style={{ marginTop: 0 }}>
          Pro unlocks job posting, full mentor access, private communities, and expanded messaging for ₦9,000/month.
        </p>
        <div className="card" style={{ padding: 18, boxShadow: "none" }}>
          <div className="row">
            <Crown color="#C9A84C" />
            <strong>Professional plan</strong>
          </div>
          <p className="muted">Built for Muslim professionals actively growing their network and visibility.</p>
        </div>
        <button className="btn btn-primary" onClick={onClose}>
          Continue to Paystack
        </button>
      </div>
    </Modal>
  );
}
