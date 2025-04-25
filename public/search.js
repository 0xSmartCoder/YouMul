let timeOut = null;
async function searchUser() {
  clearTimeout(timeOut);
  timeOut = setTimeout(async () => {
    const token = localStorage.getItem("token");
    const query = document.getElementById("searchList").value.trim();
    const searchResult = document.getElementById("searchResult");
    if (query.length < 2) {
      searchResult.innerHTML = "";
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/profile/search/?user=${query}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user = await res.json();
      searchResult.innerHTML = "";
      if (user.length === 0) {
        searchResult.innerHTML = `<li> No user found</li>`;
        return;
      }
      user.forEach((u) => {
        const li = document.createElement("li");
        li.className = "px-4 py-2 hover:bg-gray-300 border-b";
        li.innerHTML = `<a href="profile.html?userId=${u._id}" class="block w-full flex items-center">
                <img src="http://localhost:5000/${u.profilePic || "defaultAvatar.png"}"
                 alt="${u.userName}' Profile Picture"
                 class="w-10 h-10 mr-3 rounded-full"/>
                 ${u.userName}
                </a>
                `;
        searchResult.appendChild(li);
      });
    } catch (error) {
      console.log("Error:", error);
    }
  }, 300);
}
