document.addEventListener("DOMContentLoaded", function () {
  const feedUrl = "https://note.com/team_nc/rss";
  const corsProxy = "https://api.allorigins.win/raw?url=";
  const fetchUrl = corsProxy + encodeURIComponent(feedUrl);

  function formatDate(pubDate) {
    if (!pubDate) {
      return "";
    }
    const parsed = new Date(pubDate);
    if (Number.isNaN(parsed.getTime())) {
      return pubDate;
    }
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }

  async function fetchNoteFeed() {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`note feed fetch failed: ${response.status}`);
    }
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const items = Array.from(xmlDoc.querySelectorAll("item"));
    return items.map((item) => ({
      title:
        item.querySelector("title")?.textContent.trim() || "(タイトル無し)",
      link: item.querySelector("link")?.textContent.trim() || "#",
      pubDate: item.querySelector("pubDate")?.textContent.trim() || "",
    }));
  }

  async function updateIndexNotices() {
    const noticeList = document.getElementById("noticeList");
    if (!noticeList) {
      return;
    }
    try {
      const notes = await fetchNoteFeed();
      if (!notes.length) {
        return;
      }
      const maxShow = 4;
      const noteItems = notes.slice(0, maxShow);
      noteItems.reverse().forEach((item) => {
        const li = document.createElement("li");
        li.className = "notice-item";
        li.innerHTML = `
          <span class="notice-date">${formatDate(item.pubDate)}</span>
          <a href="${item.link}" target="_blank" class="news-link">note更新: ${item.title}</a>
        `;
        noticeList.insertBefore(li, noticeList.firstChild);
      });
      while (noticeList.children.length > maxShow) {
        noticeList.removeChild(noticeList.lastChild);
      }
    } catch (error) {
      console.warn("note update fetch failed", error);
    }
  }

  async function updateLatestNotes() {
    const latestList = document.getElementById("latestNoteList");
    if (!latestList) {
      return;
    }
    const fallbackItems = Array.from(latestList.children).map((node) =>
      node.cloneNode(true),
    );
    try {
      const notes = await fetchNoteFeed();
      if (!notes.length) {
        return;
      }
      latestList.innerHTML = "";
      notes.slice(0, 5).forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
        latestList.appendChild(li);
      });
    } catch (error) {
      latestList.innerHTML = "";
      if (fallbackItems.length) {
        fallbackItems.forEach((item) => latestList.appendChild(item));
      } else {
        const li = document.createElement("li");
        li.textContent = "noteの情報を取得できませんでした。";
        latestList.appendChild(li);
      }
      console.warn("note latest list fetch failed", error);
    }
  }

  updateIndexNotices();
  updateLatestNotes();
});
