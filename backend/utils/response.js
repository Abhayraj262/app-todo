// All successful API responses share { success: true, message, data }.
export function send(res, status, message, data) {
  res.status(status).json({ success: true, message, data });
}

// Mongoose document -> JSON the frontend expects (string id, no password fields).
export function toTask(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    date: doc.date,
    startTime: doc.startTime,
    endTime: doc.endTime,
    priority: doc.priority,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
