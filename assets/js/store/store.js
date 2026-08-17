"use strict";

// Shared user state, session, and LocalStorage access.

(function () {
  const STORAGE_KEYS = {
    users: "bijan_demo_users",
    currentUser: "bijan_demo_current_user",
  };

  // Helpers

  function normalizeUsername(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function normalizeUser(user) {
    if (!user || typeof user !== "object") {
      return null;
    }

    return {
      ...user,

      cart: Array.isArray(user.cart) ? user.cart : [],

      wishlist: Array.isArray(user.wishlist) ? user.wishlist : [],

      orders: Array.isArray(user.orders) ? user.orders : [],
    };
  }

  // User persistence

  function getUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(normalizeUser).filter(Boolean);
    } catch (error) {
      console.error("BijanStore getUsers error:", error);

      return [];
    }
  }

  function saveUsers(users) {
    try {
      const normalizedUsers = Array.isArray(users)
        ? users.map(normalizeUser).filter(Boolean)
        : [];

      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(normalizedUsers));

      return true;
    } catch (error) {
      console.error("BijanStore saveUsers error:", error);

      return false;
    }
  }

  // User lookup

  function getUserById(userId) {
    if (!userId) {
      return null;
    }

    return (
      getUsers().find(function (user) {
        return user.id === userId;
      }) || null
    );
  }

  function findUserByUsername(username) {
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername) {
      return null;
    }

    return (
      getUsers().find(function (user) {
        return normalizeUsername(user.username) === normalizedUsername;
      }) || null
    );
  }

  function usernameExists(username) {
    return Boolean(findUserByUsername(username));
  }

  // Session management

  function getCurrentUserId() {
    try {
      return localStorage.getItem(STORAGE_KEYS.currentUser);
    } catch (error) {
      console.error("BijanStore session read error:", error);

      return null;
    }
  }

  function getCurrentUser() {
    const userId = getCurrentUserId();

    if (!userId) {
      return null;
    }

    const user = getUserById(userId);

    if (!user) {
      clearSession();

      return null;
    }

    return user;
  }

  function setCurrentUser(userOrId) {
    try {
      const userId = typeof userOrId === "object" ? userOrId?.id : userOrId;

      if (!userId) {
        clearSession();

        return null;
      }

      const user = getUserById(userId);

      if (!user) {
        clearSession();

        return null;
      }

      localStorage.setItem(STORAGE_KEYS.currentUser, user.id);

      return user;
    } catch (error) {
      console.error("BijanStore setCurrentUser error:", error);

      return null;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    } catch (error) {
      console.error("BijanStore clearSession error:", error);
    }
  }

  // User updates

  function updateUser(userId, updater) {
    if (!userId || typeof updater !== "function") {
      return null;
    }

    const users = getUsers();

    const index = users.findIndex(function (user) {
      return user.id === userId;
    });

    if (index < 0) {
      return null;
    }

    const user = normalizeUser({
      ...users[index],

      cart: [...users[index].cart],

      wishlist: [...users[index].wishlist],

      orders: [...users[index].orders],
    });

    updater(user);

    const normalizedUser = normalizeUser(user);

    users[index] = normalizedUser;

    if (!saveUsers(users)) {
      return null;
    }

    document.dispatchEvent(
      new CustomEvent("store:user-updated", {
        detail: {
          user: normalizedUser,
        },
      }),
    );

    return normalizedUser;
  }

  function updateCurrentUser(updater) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return null;
    }

    return updateUser(currentUser.id, updater);
  }

  // Public API

  window.BijanStore = Object.freeze({
    getUsers,
    saveUsers,

    getUserById,
    findUserByUsername,
    usernameExists,

    getCurrentUser,
    setCurrentUser,
    clearSession,

    updateUser,
    updateCurrentUser,
  });
})();
