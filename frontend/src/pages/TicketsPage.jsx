import { useEffect, useState, useRef } from "react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentFile, setCommentFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketFile, setTicketFile] = useState(null);
  const [user, setUser] = useState(null);

  const detailsRef = useRef(null);

  const decodeToken = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
      fetchTickets(token);
    }
  }, []);

  const fetchTickets = async (token) => {
    try {
      const response = await fetch("http://localhost:4000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error("Ticket creation failed");

      const newTicket = await response.json();

      if (ticketFile) {
        const formData = new FormData();
        formData.append("file", ticketFile);

        await fetch(`http://localhost:4000/api/attachments/${newTicket.ticket.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      setTitle("");
      setDescription("");
      setTicketFile(null);
      e.target.reset();
      fetchTickets(token);
      alert("Ticket created successfully!");
    } catch (err) {
      console.error("Error creating ticket:", err);
    }
  };

  const fetchComments = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const [commentsRes, attachmentsRes] = await Promise.all([
        fetch(`http://localhost:4000/api/comments/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:4000/api/attachments/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const commentsData = await commentsRes.json();
      const attachmentsData = await attachmentsRes.json();

      setComments(commentsData);
      setAttachments(attachmentsData); // 🆕
    } catch (err) {
      console.error("Error fetching comments/attachments:", err);
    }
  };

  const addComment = async (ticketId) => {
    if (!newComment.trim() && !commentFile) return;
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/comments/${ticketId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (!response.ok) throw new Error("Failed to post comment");

      const commentData = await response.json();

      if (commentFile) {
        const formData = new FormData();
        formData.append("file", commentFile);

        await fetch(`http://localhost:4000/api/attachments/${ticketId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      setNewComment("");
      setCommentFile(null);
      fetchComments(ticketId);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/tickets/${ticketId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        const { ticket } = await response.json();
        setSelectedTicket(ticket);
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? ticket : t))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-green-600 bg-green-100";
      case "in progress":
        return "text-yellow-700 bg-yellow-100";
      case "closed":
        return "text-gray-600 bg-gray-200";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    fetchComments(ticket.id);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const ticketAttachments = attachments.filter((a) => !a.comment_id);
  const commentAttachments = (commentId) =>
    attachments.filter((a) => a.comment_id === commentId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tickets</h1>

      {user?.role !== "technician" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-xl p-6 mb-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setTicketFile(e.target.files[0])}
              className="text-sm text-gray-600"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Ticket
          </button>
        </form>
      )}

      <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => handleTicketSelect(ticket)}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-3 font-medium">{ticket.title}</td>
                <td className="px-6 py-3">{ticket.description}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status || "Open"}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500 text-sm">
                  {new Date(ticket.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div ref={detailsRef} className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {selectedTicket.title}
          </h2>
          <p className="text-gray-600 mb-2">{selectedTicket.description}</p>

          {ticketAttachments.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-sm text-gray-700 mb-1">Attachments:</p>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {ticketAttachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`http://localhost:4000/${a.filepath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      {a.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-4">
            Status:{" "}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                selectedTicket.status
              )}`}
            >
              {selectedTicket.status}
            </span>
          </p>

          {["technician", "admin"].includes(user?.role) && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Update Status:
              </label>
              <select
                value={selectedTicket.status}
                onChange={(e) =>
                  updateStatus(selectedTicket.id, e.target.value)
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}

          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="border rounded-lg p-3 bg-gray-50 text-sm"
              >
                <p>{c.content}</p>

                {commentAttachments(c.id).length > 0 && (
                  <ul className="list-disc list-inside text-xs text-blue-600 mt-2">
                    {commentAttachments(c.id).map((a) => (
                      <li key={a.id}>
                        <a
                          href={`http://localhost:4000/${a.filepath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          {a.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-gray-500 mt-1 text-xs">
                  — {c.author_name || "Unknown"} ({c.author_role}) •{" "}
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              onChange={(e) => setCommentFile(e.target.files[0])}
              className="text-sm text-gray-600"
            />
            <button
              onClick={() => addComment(selectedTicket.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 self-start"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}