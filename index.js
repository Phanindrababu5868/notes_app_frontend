function toggleForm() {
  const register = document.getElementById("register-form");
  const login = document.getElementById("login-form");

  if (register.style.display === "none") {
    register.style.display = "block";
    login.reset();
    login.style.display = "none";
  } else {
    register.style.display = "none";
    register.reset();
    login.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://notes-app-backend-mpa4.onrender.com/api";
  let authToken = localStorage.getItem("authToken");

  let colors = [
    "#ffffff",
    "#facccc",
    "#FFF8BC",
    "#bae1d3",
    "#d8fff6",
    "#F0DDF8",
  ];

  let tabs = ["Notes", "Archive", "Trash"];
  let activeTab = "notes";

  function addTabs() {
    const tabsContainer = document.getElementById("tabs-list");
    tabsContainer.classList.add("tab-container");
    tabsContainer.innerHTML = ``;
    tabs.forEach((each) => {
      const tab = document.createElement("span");

      tab.textContent = each;
      tab.classList.add(
        activeTab === each.toLowerCase() ? "active-tab" : "tab"
      );
      tab.addEventListener("click", () => {
        activeTab = each.toLocaleLowerCase();
        tabsContainer.appendChild(tab);
        addTabs();
        fetchNotes();
      });
      tabsContainer.appendChild(tab);
    });
  }

  function displayNotes(notes) {
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = "";
    if (notes.length === 0) {
      notesList.innerHTML = `<p>Notes you add appear here </p>`;
    }
    notes.forEach((note) => {
      const noteContainer = document.createElement("div");
      noteContainer.classList.add("note");
      noteContainer.style.backgroundColor = note.backgroundColor;

      const titleElement = document.createElement("div");
      titleElement.classList.add("note-title");
      titleElement.textContent = note.title;

      const contentElement = document.createElement("div");
      contentElement.classList.add("note-content");
      contentElement.textContent = note.content;

      const tagsElement = document.createElement("div");
      tagsElement.classList.add("note-tags");
      tagsElement.textContent = note.tags.join(", ");

      const actionContainer = document.createElement("div");
      actionContainer.classList.add("action-container");

      const label = document.createElement("label");
      label.textContent = "color";

      actionContainer.appendChild(label);

      const bgColor = document.createElement("select");
      bgColor.style.backgroundColor = note.backgroundColor;

      colors.forEach((each) => {
        const option = document.createElement("option");
        option.value = each;
        option.textContent = each;
        option.style.backgroundColor = each;
        bgColor.appendChild(option);
      });

      bgColor.value = note.backgroundColor;

      bgColor.onchange = function (e) {
        const color = e.target.value;
        changeBackground(note, color);
        noteContainer.style.backgroundColor = color;
        bgColor.style.backgroundColor = color;
      };

      actionContainer.appendChild(bgColor);

      if (activeTab === "trash") {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "delete";
        deleteButton.addEventListener("click", () => deleteNotes(note._id));

        const reStoreButton = document.createElement("button");
        reStoreButton.textContent = "reStore";
        reStoreButton.addEventListener("click", () => trashNote(note));

        actionContainer.appendChild(deleteButton);
        actionContainer.appendChild(reStoreButton);
      } else {
        const archiveButton = document.createElement("button");
        archiveButton.textContent =
          activeTab === "archive" ? "unArchive" : "archive";
        archiveButton.addEventListener("click", () => archiveNote(note));

        const trashButton = document.createElement("button");
        trashButton.textContent = "Trash";
        trashButton.addEventListener("click", () => trashNote(note));

        actionContainer.appendChild(archiveButton);
        actionContainer.appendChild(trashButton);
      }

      noteContainer.appendChild(titleElement);
      noteContainer.appendChild(contentElement);
      noteContainer.appendChild(tagsElement);
      noteContainer.appendChild(actionContainer);

      notesList.appendChild(noteContainer);
    });
  }

  const showAuthSection = () => {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("notes-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
  };

  const showNotesSection = () => {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("notes-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline";
    addTabs();
    fetchNotes();
  };

  const changeBackground = (note, color) => {
    fetch(`${API_URL}/notes/${note._id}`, {
      method: "PUT",
      headers: {
        "x-auth-token": authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...note,
        backgroundColor: color,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to trash note");
        }
        return response.json();
      })
      .then((updatedNote) => {
        // fetchNotes(); // Refresh notes list after trashing
      })
      .catch((error) => {
        console.error("Error trashing note:", error);
        handleUnauthorized(error);
      });
  };

  const archiveNote = (note) => {
    fetch(`${API_URL}/notes/${note._id}`, {
      method: "PUT",
      headers: {
        "x-auth-token": authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...note, isArchived: !note.isArchived }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to archive note");
        }
        return response.json();
      })
      .then((updatedNote) => {
        fetchNotes(); // Refresh notes list after archiving
      })
      .catch((error) => {
        console.error("Error archiving note:", error);
        handleUnauthorized(error);
      });
  };

  const trashNote = (note) => {
    fetch(`${API_URL}/notes/${note._id}`, {
      method: "PUT",
      headers: {
        "x-auth-token": authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...note,
        isTrashed: !note.isTrashed,
        isArchived: false,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to trash note");
        }
        return response.json();
      })
      .then((updatedNote) => {
        fetchNotes(); // Refresh notes list after trashing
      })
      .catch((error) => {
        console.error("Error trashing note:", error);
        handleUnauthorized(error);
      });
  };

  const deleteNotes = (id) => {
    fetch(`${API_URL}/notes/${id}`, {
      method: "DELETE",
      headers: {
        "x-auth-token": authToken,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => fetchNotes())
      .catch((err) => {});
  };
  const fetchNotes = () => {
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = "<p>Loading Notes....</p>";
    fetch(`${API_URL}/notes/${activeTab === "notes" ? "" : activeTab}`, {
      headers: {
        "x-auth-token": authToken,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        return response.json();
      })
      .then((notes) => {
        displayNotes(notes);
      })
      .catch((error) => {
        console.error("Error fetching notes:", error);
        handleUnauthorized(error);
      });
  };

  const searchNotes = (searchTerm) => {
    fetch(`${API_URL}/notes/search?query=${searchTerm}`, {
      headers: {
        "x-auth-token": authToken,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to search notes");
        }
        return response.json();
      })
      .then((notes) => {
        displayNotes(notes);
      })
      .catch((error) => {
        console.error("Error searching notes:", error);
        handleUnauthorized(error);
      });
  };

  const handleUnauthorized = (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      showAuthSection();
    } else {
      console.error("Unhandled error:", error);
    }
  };

  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.success) {
          authToken = response.token;
          localStorage.setItem("authToken", authToken);
          document.getElementById("register-username").value = "";
          document.getElementById("register-password").value = "";
          showNotesSection();
        } else {
          alert(response.message || "Registration failed");
        }
      })
      .catch((error) => {
        console.error("Error registering:", error);
        alert(error.message || "Registration failed");
      });
  });

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const btn = document.getElementById("login-btn");
    btn.textContent = "Logging in...";
    btn.setAttribute("aria-disabled", "true");
    btn.disabled = true;

    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.success) {
          authToken = response.token;
          localStorage.setItem("authToken", authToken);
          document.getElementById("login-username").value = "";
          document.getElementById("login-password").value = "";
          showNotesSection();
        } else {
          alert(response.message || "Login failed");
        }
      })
      .catch((error) => {
        alert(error.message || "Something went wrong, please try again");
      })
      .finally(() => {
        btn.textContent = "Login";
        btn.removeAttribute("aria-disabled");
        btn.disabled = false;
      });
  });

  document.getElementById("create-note-btn").addEventListener("click", () => {
    const title = document.getElementById("note-title").value;
    const content = document.getElementById("note-content").value;
    const tags = document
      .getElementById("note-tags")
      .value.split(",")
      .map((tag) => tag.trim());

    fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": authToken,
      },
      body: JSON.stringify({ title, content, tags }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create note");
        }
        return response.json();
      })
      .then((note) => {
        console.log("Note created:", note);
        document.getElementById("note-title").value = "";
        document.getElementById("note-content").value = "";
        document.getElementById("note-tags").value = "";
        fetchNotes();
      })
      .catch((error) => {
        console.error("Error creating note:", error);
        handleUnauthorized(error);
      });
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = "";
    showAuthSection();
  });

  document.getElementById("search-btn").addEventListener("click", () => {
    const searchTerm = document.getElementById("search-input").value.trim();
    if (searchTerm) {
      searchNotes(searchTerm);
    } else {
      fetchNotes();
    }
  });

  if (authToken) {
    showNotesSection();
  } else {
    showAuthSection();
  }
});
