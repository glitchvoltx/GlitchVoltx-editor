import { EditorElement, ElementType } from "../types";
import { generateId } from "./id";

export const createTemplate = (templateName: string): EditorElement => {
  const root = createNewElement("container");
  root.props.style = {
    ...root.props.style,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    backgroundColor: "#ffffff",
    padding: "48px 24px",
    width: "calc(100% + 48px)",
    marginLeft: "-24px",
    marginRight: "-24px",
    borderWidth: "0px",
  };

  if (templateName === "hero") {
    const heading = createNewElement("heading");
    heading.props.text = "Build Faster Than Ever";
    heading.props.style = {
      ...heading.props.style,
      fontSize: "48px",
      textAlign: "center",
    };

    const text = createNewElement("text");
    text.props.text =
      "Our platform provides the necessary tools to increase your productivity.";
    text.props.style = {
      ...text.props.style,
      fontSize: "18px",
      textAlign: "center",
      color: "#666",
    };

    const btn = createNewElement("button");
    btn.props.text = "Get Started Now";
    btn.props.style = { ...btn.props.style, margin: "0 auto" };

    root.children = [heading, text, btn];
  } else if (templateName === "faq") {
    const heading = createNewElement("heading");
    heading.props.text = "Frequently Asked Questions";
    heading.props.style = {
      ...heading.props.style,
      textAlign: "center",
      fontSize: "32px",
    };

    const list = createNewElement("container");
    list.props.style = {
      ...list.props.style,
      backgroundColor: "transparent",
      borderWidth: "0px",
      padding: "0px",
    };

    const createFaqItem = (q: string, a: string) => {
      const wrapper = createNewElement("container");
      wrapper.props.style = {
        ...wrapper.props.style,
        borderWidth: "0 0 1px 0",
        borderStyle: "solid",
        borderColor: "#eee",
        borderRadius: "0px",
        padding: "16px 0",
        gap: "8px",
      };
      const qt = createNewElement("heading");
      qt.props.text = q;
      qt.props.style = { ...qt.props.style, fontSize: "18px", margin: "0" };
      const at = createNewElement("text");
      at.props.text = a;
      at.props.style = { ...at.props.style, fontSize: "14px", color: "#666" };
      wrapper.children = [qt, at];
      return wrapper;
    };

    list.children = [
      createFaqItem(
        "How do I get started?",
        "Sign up for an account and follow the quick start guide.",
      ),
      createFaqItem(
        "What is your refund policy?",
        "We offer a 30-day money-back guarantee no questions asked.",
      ),
    ];
    root.children = [heading, list];
  } else if (templateName === "pricing") {
    const heading = createNewElement("heading");
    heading.props.text = "Simple Pricing";
    heading.props.style = { ...heading.props.style, textAlign: "center" };

    const cardsContainer = createNewElement("container");
    cardsContainer.props.style = {
      ...cardsContainer.props.style,
      flexDirection: "row",
      gap: "24px",
      backgroundColor: "transparent",
      borderWidth: "0px",
      padding: "0px",
    };

    const createCard = (title: string, price: string) => {
      const c = createNewElement("container");
      c.props.style = {
        ...c.props.style,
        padding: "32px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#eee",
        borderRadius: "12px",
        alignItems: "center",
      };
      const t = createNewElement("heading");
      t.props.text = title;
      t.props.style = { ...t.props.style, fontSize: "24px" };
      const p = createNewElement("text");
      p.props.text = price;
      p.props.style = {
        ...p.props.style,
        fontSize: "48px",
        fontWeight: "bold",
      };
      const b = createNewElement("button");
      b.props.text = "Select Plan";
      c.children = [t, p, b];
      return c;
    };

    cardsContainer.children = [
      createCard("Basic", "$9"),
      createCard("Pro", "$29"),
      createCard("Enterprise", "$99"),
    ];
    root.children = [heading, cardsContainer];
  } else if (templateName === "navbar") {
    root.props.style = {
      ...root.props.style,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: "16px 24px",
      alignItems: "center",
      marginTop: "-24px",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: "#eee",
    };
    const logo = createNewElement("heading");
    logo.props.text = "Brand";
    logo.props.style = { ...logo.props.style, fontSize: "24px", margin: "0" };

    const links = createNewElement("container");
    links.props.style = {
      ...links.props.style,
      flexDirection: "row",
      gap: "24px",
      padding: "0",
      borderWidth: "0px",
      backgroundColor: "transparent",
      alignItems: "center",
    };

    const l1 = createNewElement("text");
    l1.props.text = "Home";
    l1.props.style.fontSize = "14px";
    const l2 = createNewElement("text");
    l2.props.text = "About";
    l2.props.style.fontSize = "14px";
    const l3 = createNewElement("button");
    l3.props.text = "Sign In";

    links.children = [l1, l2, l3];
    root.children = [logo, links];
  } else if (templateName === "footer") {
    root.props.style = {
      ...root.props.style,
      backgroundColor: "#111",
      color: "#fff",
      padding: "48px 24px",
      marginBottom: "-24px",
    };
    const text = createNewElement("text");
    text.props.text = "© 2026 Brand Inc. All rights reserved.";
    text.props.style = {
      ...text.props.style,
      textAlign: "center",
      color: "#888",
    };
    root.children = [text];
  }

  return root;
};

export const createNewElement = (type: ElementType): EditorElement => {
  const baseElement: EditorElement = {
    id: generateId(),
    type,
    props: {
      style: {},
    },
    children: [],
  };

  switch (type) {
    case "container":
      baseElement.props.style = {
        padding: "16px",
        minHeight: "50px",
        width: "100%",
        backgroundColor: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        borderRadius: "0px",
        borderWidth: "1px",
        borderStyle: "dashed",
        borderColor: "#d1d5db",
      };
      break;
    case "text":
      baseElement.props.text = "Double click or use sidebar to edit this text.";
      baseElement.props.style = {
        fontSize: "16px",
        color: "#1f2937",
        lineHeight: "1.5",
      };
      break;
    case "heading":
      baseElement.props.text = "Heading";
      baseElement.props.style = {
        fontSize: "32px",
        fontWeight: "bold",
        color: "#111827",
        margin: "0 0 16px 0",
      };
      break;
    case "button":
      baseElement.props.text = "Click Me";
      baseElement.props.style = {
        padding: "8px 16px",
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        borderRadius: "6px",
        cursor: "pointer",
        textAlign: "center",
        display: "inline-block",
        borderWidth: "0px",
        fontWeight: "500",
      };
      break;
    case "image":
      baseElement.props.src =
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
      baseElement.props.alt = "Placeholder Image";
      baseElement.props.style = {
        width: "100%",
        height: "auto",
        borderRadius: "8px",
        objectFit: "cover",
      };
      break;
    case "video":
      baseElement.props.src = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      baseElement.props.style = {
        width: "100%",
        height: "315px",
        borderRadius: "8px",
        borderWidth: "0px",
      };
      break;
    case "divider":
      baseElement.props.style = {
        width: "100%",
        height: "1px",
        backgroundColor: "#d1d5db",
        margin: "16px 0",
      };
      break;
    case "input":
      baseElement.props.placeholder = "Enter text...";
      baseElement.props.inputType = "text";
      baseElement.props.style = {
        padding: "8px 12px",
        borderWidth: "1px",
        borderColor: "#d1d5db",
        borderStyle: "solid",
        borderRadius: "4px",
        width: "100%",
        fontSize: "16px",
      };
      break;
    case "slider":
      baseElement.props.min = 0;
      baseElement.props.max = 100;
      baseElement.props.value = 50;
      baseElement.props.style = {
        width: "100%",
        margin: "8px 0",
      };
      break;
    case "icon":
      baseElement.props.iconName = "Star";
      baseElement.props.style = {
        width: "24px",
        height: "24px",
        color: "#000000",
        display: "inline-block",
      };
      break;
    case "spacer":
      baseElement.props.style = {
        width: "100%",
        height: "32px",
        display: "block",
      };
      break;
    case "textarea":
      baseElement.props.placeholder = "Enter long text here...";
      baseElement.props.style = {
        padding: "8px 12px",
        borderWidth: "1px",
        borderColor: "#d1d5db",
        borderStyle: "solid",
        borderRadius: "4px",
        width: "100%",
        minHeight: "100px",
        fontSize: "16px",
        resize: "vertical",
      };
      break;
    case "checkbox":
      baseElement.props.label = "Checkbox option";
      baseElement.props.checked = false;
      baseElement.props.style = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        margin: "8px 0",
      };
      break;
    case "audio":
      baseElement.props.src =
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      baseElement.props.style = {
        width: "100%",
        margin: "8px 0",
      };
      break;
    case "map":
      baseElement.props.src =
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d158858.18237072596!2d-0.10159865000000001!3d51.52864165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1718817755325!5m2!1sen!2sus";
      baseElement.props.style = {
        width: "100%",
        height: "300px",
        borderWidth: "0px",
        borderRadius: "8px",
      };
      break;
    case "badge":
      baseElement.props.text = "New";
      baseElement.props.style = {
        padding: "4px 8px",
        backgroundColor: "#ef4444",
        color: "#ffffff",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: "bold",
        display: "inline-block",
      };
      break;
    case "progress":
      baseElement.props.value = 50;
      baseElement.props.max = 100;
      baseElement.props.style = {
        width: "100%",
        height: "8px",
        borderRadius: "9999px",
        backgroundColor: "#e5e7eb",
        overflow: "hidden",
      };
      break;
    case "slideshow":
      baseElement.props.images = [
        "https://images.unsplash.com/photo-1506744626753-1fa44df62243?w=800&q=80",
        "https://images.unsplash.com/photo-1470770903672-7cda27092923?w=800&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      ];
      baseElement.props.autoPlay = true;
      baseElement.props.loop = true;
      baseElement.props.interval = 3000;
      baseElement.props.showArrows = true;
      baseElement.props.showDots = true;
      baseElement.props.style = {
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
      };
      break;
    case "customCode":
      baseElement.props.code =
        '<div style="padding: 20px; background: #f3f4f6; color: #333; text-align: center; border-radius: 8px;">Hello Custom HTML!</div>';
      baseElement.props.style = {
        width: "100%",
      };
      break;
  }

  return baseElement;
};

export const initialRootElement: EditorElement = {
  id: "root",
  type: "container",
  props: {
    style: {
      width: "100%",
      minHeight: "100%",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      padding: "24px",
      gap: "24px",
    },
  },
  children: [
    {
      id: generateId(),
      type: "heading",
      props: {
        text: "Welcome to your new site",
        style: {
          fontSize: "48px",
          fontWeight: "bold",
          color: "#111827",
          textAlign: "center",
        },
      },
      children: [],
    },
    {
      id: generateId(),
      type: "text",
      props: {
        text: "Start building your page by adding elements from the sidebar, selecting them, and modifying their properties.",
        style: {
          fontSize: "18px",
          color: "#4b5563",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        },
      },
      children: [],
    },
  ],
};
