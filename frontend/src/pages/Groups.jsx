import { useEffect, useState } from "react";
import { api } from "../api";
import { useI18n } from "../i18n";
import { useToast } from "../components/Toast";

export default function Groups() {
  const { t } = useI18n();
  const toast = useToast();
  const [myGroup, setMyGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [invites, setInvites] = useState([]);
  const [members, setMembers] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [group, inv, mem, received] = await Promise.all([
        api("/groups/me"),
        api("/groups/invites"),
        api("/groups/members"),
        api("/groups/invites/received"),
      ]);
      setMyGroup(group?.id ? group : null);
      setInvites(inv);
      setMembers(mem);
      setReceivedInvites(received);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    if (groupName.trim().length < 3)
      return toast.error("Nama grup minimal 3 karakter");
    setBusy(true);
    try {
      await api("/groups", {
        method: "POST",
        body: { name: groupName.trim() },
      });
      toast.success("Grup berhasil dibuat");
      setGroupName("");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const invite = async (e) => {
    e.preventDefault();
    if (inviteUsername.trim().length < 3)
      return toast.error("Username minimal 3 karakter");
    setBusy(true);
    try {
      await api("/groups/invite", {
        method: "POST",
        body: { username: inviteUsername.trim() },
      });
      toast.success("Undangan terkirim");
      setInviteUsername("");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const acceptInvite = async (id) => {
    setBusy(true);
    try {
      await api(`/groups/invites/${id}/accept`, { method: "POST" });
      toast.success(t("groups.accepted"));
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const rejectInvite = async (id) => {
    setBusy(true);
    try {
      await api(`/groups/invites/${id}/reject`, { method: "POST" });
      toast.success(t("groups.rejected"));
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const isOwner = myGroup?.role === "owner";

  if (loading) {
    return (
      <div className="page-head">
        <h1 className="page-title">Grup</h1>
        <p className="muted">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Grup</h1>
        </div>
      </div>

      {myGroup ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{myGroup.name}</h2>
              <p className="muted">
                {isOwner
                  ? t("groups.ownerInfo")
                  : t("groups.memberInfo", { name: myGroup.name })}
              </p>
            </div>
            <span className="pill">{members.length} anggota</span>
          </div>
          <div className="member-list">
            {members.length === 0 ? (
              <p className="muted">Belum ada anggota</p>
            ) : (
              members.map((m) => (
                <div className="member-row" key={m.id}>
                  <span className="avatar">
                    {m.username?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <div className="member-info">
                    <span className="strong">{m.username}</span>
                    <span className="muted small">
                      {m.role === "owner" ? "Admin grup" : "Anggota"}
                    </span>
                  </div>
                  {m.role === "owner" && <span className="pill">Admin</span>}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="panel">
          <h2>Buat Grup Baru</h2>
          <form onSubmit={createGroup} className="settings-form">
            <label className="field">
              <span className="field-label">Nama Grup</span>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                minLength={3}
                maxLength={50}
                required
              />
            </label>
            <button type="submit" disabled={busy}>
              Buat Grup
            </button>
          </form>
        </div>
      )}

      {myGroup && isOwner && (
        <div className="panel">
          <h2>Undang Anggota</h2>
          <form onSubmit={invite} className="settings-form">
            <label className="field">
              <span className="field-label">Username</span>
              <input
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                minLength={3}
                required
              />
            </label>
            <button type="submit" disabled={busy}>
              Kirim Undangan
            </button>
          </form>
          {invites.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>Undangan Pending</h3>
              <ul>
                {invites.map((inv) => (
                  <li key={inv.id}>{inv.invitedUsername}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {receivedInvites.length > 0 && (
        <div className="panel">
          <h2>{t("groups.receivedTitle")}</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {receivedInvites.map((inv) => (
              <li
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p className="strong">{inv.group?.name}</p>
                  <p className="muted">
                    {t("groups.invitedBy", {
                      username: inv.invitedBy?.username,
                    })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => acceptInvite(inv.id)}
                  >
                    {t("groups.accept")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="ghost"
                    onClick={() => rejectInvite(inv.id)}
                  >
                    {t("groups.reject")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
