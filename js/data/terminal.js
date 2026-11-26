// Terminal easter egg: command texts. Edit content here only.
// Text wrapped in **...** is highlighted (rendered as <b> via textContent, never parsed as HTML).
// "\n" starts a new line.

export const PROMPT = "roy@portfolio:~$";
export const TITLE = "roy@portfolio: ~";

export const WELCOME = "Welcome. Type **help** to see commands. **Esc** to close.";

// Email is assembled at runtime so the full address never appears as one string in the source.
const EMAIL_USER = "roy.perelman";
const EMAIL_DOMAIN = "gmail.com";

export const CONTACT_LINKS = [
  { name: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/roy-perelman-a478a7398/", external: true },
  { name: "email", label: "Email", href: () => `mailto:${EMAIL_USER}@${EMAIL_DOMAIN}`, external: false },
  { name: "whatsapp", label: "WhatsApp", href: "https://wa.me/972505970059", external: true },
];

// Order here is the order shown by `help` and used for Tab completion.
export const commands = {
  help:
    "Commands: **whoami**, **skills**, **experience**, **education**, **contact**, **clear**, **exit**\n" +
    "Tips: **↑/↓** history · **Tab** completes · **Esc** closes",
  whoami:
    "**Roy Perelman** · SRE Engineer, Cloud Network Firewall @ Check Point · " +
    "CS & Economics student @ Tel Aviv University · AI Club member",
  skills:
    "**cloud:**       AWS, Azure, GCP, Kubernetes, Docker, Linux\n" +
    "**automation:**  Bash, Git, GitLab\n" +
    "**engineering:** Python, Java, C, Data Structures, Algorithms, Design Patterns, AI Tools\n" +
    "**ops:**         incident response, production monitoring, runbooks\n" +
    "**languages:**   Hebrew (native), English (high)",
  experience:
    "**Nov 2026–now**  AI Club member, TAU\n" +
    "**Sep 2026–now**  SRE Engineer, Check Point (Cloud Network Firewall, Cloud Operations)\n" +
    "**2022**          Operational planning team, attack department (military service)\n" +
    "**2021**          Innovation Leader, Israeli Air Force",
  education:
    "**2024–now**   B.Sc. Computer Science & Economics, Tel Aviv University\n" +
    "**2016–2019**  Hadarim high school, Hod Hasharon (with excellence)",
  contact: CONTACT_LINKS, // rendered as clickable links
  clear: null, // handled in code
  exit: null, // handled in code
};

export const HIDDEN_COMMANDS = {
  "sudo hire roy": "**Permission granted.** Great choice.",
};

// User input is inserted as plain text between these two parts (never parsed for **...**).
export const NOT_FOUND = { before: "command not found: ", after: " · try **help**" };
