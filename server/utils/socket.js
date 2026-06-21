let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit(event, data);
  }
};
