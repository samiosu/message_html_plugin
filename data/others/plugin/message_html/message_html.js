/* Inline HTML for TyranoScript message text. Load after kag.tag.js, before startup. */
(function () {
    "use strict";

    const kagDefinition = tyrano.plugin.kag;
    const text = kagDefinition.tag.text;
    if (text.messageHTMLInstalled) return;
    text.messageHTMLInstalled = true;

    // Message text lives inside a paragraph. Block elements and executable HTML
    // are deliberately outside this plugin's display-oriented vocabulary.
    const inlineTags = new Set([
        "span", "b", "strong", "i", "em", "u", "s", "del", "small", "big",
        "sub", "sup", "code", "kbd", "samp", "var", "abbr", "mark",
        "ruby", "rb", "rt", "rp", "br", "wbr", "img",
    ]);
    const voidTags = new Set(["br", "wbr", "img"]);
    const reservedClasses = new Set([
        "char", "current_span", "entity", "fill", "stroke", "dummy", "animchar",
        "text-shadow", "text-stroke", "message-html-atom",
    ]);
    const original = {};
    for (const name of [
        "showMessage", "buildMessageHTML", "pushTextToBackLog", "speechMessage",
        "addChars", "makeOneCharVisible", "makeAllCharsVisible",
    ]) original[name] = text[name];

    // These display attributes must survive Tyrano's normal save/load filter.
    for (const name of ["title", "lang", "dir", "alt"]) {
        if (!kagDefinition.array_white_attr.includes(name)) {
            kagDefinition.array_white_attr.push(name);
        }
    }

    function state(kag) {
        if (!kag.stat.message_html) {
            kag.stat.message_html = { enabled: true, scopes: {} };
        }
        return kag.stat.message_html;
    }

    function scope(kag) {
        return kag.stat.current_layer + ":" + kag.stat.current_page;
    }

    function escapeHTML(value) {
        return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function decodeText(value) {
        const template = document.createElement("template");
        // Decode entities without treating a literal '<' in prose as an element.
        template.innerHTML = value.replace(/</g, "&lt;");
        return template.content.textContent;
    }

    function safeElement(token, name) {
        const template = document.createElement("template");
        template.innerHTML = token;
        const source = template.content.firstElementChild;
        const element = document.createElement(name);
        if (!source) return element;

        // reset.css disables the browser's normal strong/em defaults.
        if (name === "strong" || name === "b") element.style.fontWeight = "bold";
        if (["i", "em", "var"].includes(name)) element.style.fontStyle = "italic";
        for (const attribute of source.attributes) {
            const key = attribute.name.toLowerCase();
            if (key === "style") element.style.cssText += ";" + attribute.value;
            else if (key === "class") {
                element.className = attribute.value.split(/\s+/)
                    .filter(value => value && !reservedClasses.has(value)).join(" ");
            } else if (["title", "lang", "dir"].includes(key)) {
                element.setAttribute(key, attribute.value);
            } else if (name === "img" && ["alt", "width", "height"].includes(key)) {
                element.setAttribute(key, attribute.value);
            } else if (name === "img" && key === "src") {
                const value = attribute.value.trim();
                try {
                    const url = new URL(value, document.baseURI);
                    if (["http:", "https:", "file:"].includes(url.protocol) ||
                        /^data:image\/(png|jpeg|gif|webp|avif);/i.test(value)) {
                        element.setAttribute("src", value);
                    }
                } catch (_) { /* An invalid image URL must not stop the scenario. */ }
            }
        }
        return element;
    }

    function openingHTML(element) {
        const html = element.cloneNode(false).outerHTML;
        return voidTags.has(element.localName) ? html :
            html.slice(0, -(element.localName.length + 3));
    }

    function parseMessage(message, previousStack, enabled) {
        const fragment = document.createDocumentFragment();
        const elements = [fragment];
        const stack = [];
        function open(element) {
            elements[elements.length - 1].appendChild(element);
            if (!voidTags.has(element.localName)) {
                elements.push(element);
                stack.push({ name: element.localName, html: openingHTML(element) });
            }
        }
        function appendText(value, decode) {
            if (value) elements[elements.length - 1].appendChild(
                document.createTextNode(decode ? decodeText(value) : value));
        }
        if (!enabled) {
            appendText(message, false);
            return { fragment, stack };
        }
        for (const entry of previousStack) open(safeElement(entry.html, entry.name));

        // Quotes may contain '>'. Tyrano's own [tags] have already been parsed.
        const tokens = /<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*>/gi;
        let position = 0;
        let match;
        while ((match = tokens.exec(message))) {
            appendText(message.slice(position, match.index), true);
            position = tokens.lastIndex;
            const token = match[0];
            if (token.startsWith("<!--")) continue;
            const name = match[1].toLowerCase();
            if (!inlineTags.has(name)) {
                appendText(token, false);
            } else if (token.startsWith("</")) {
                const index = stack.map(entry => entry.name).lastIndexOf(name);
                if (index !== -1) {
                    stack.length = index;
                    elements.length = index + 1;
                }
            } else {
                open(safeElement(token, name));
                if (/\/\s*>$/.test(token) && !voidTags.has(name)) {
                    stack.pop();
                    elements.pop();
                }
            }
        }
        appendText(message.slice(position), true);
        return { fragment, stack };
    }

    function plainText(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (["rt", "rp", "wbr"].includes(node.localName)) return "";
            if (node.localName === "br") return "\n";
            if (node.localName === "img") return node.getAttribute("alt") || "";
        }
        return Array.from(node.childNodes, plainText).join("");
    }

    function messageHTML(node, tag, inlineBlock) {
        if (node.nodeType === Node.TEXT_NODE) {
            return original.buildMessageHTML.call(tag, node.textContent, inlineBlock);
        }
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            return Array.from(node.childNodes, child => messageHTML(child, tag, inlineBlock)).join("");
        }
        if (node.localName === "img" || node.localName === "ruby") {
            // A ruby annotation and its base appear together, as with [ruby].
            return '<span class="char message-html-atom" style="opacity:0">' + node.outerHTML + "</span>";
        }
        if (voidTags.has(node.localName)) return node.outerHTML;
        return openingHTML(node) +
            Array.from(node.childNodes, child => messageHTML(child, tag, inlineBlock)).join("") +
            "</" + node.localName + ">";
    }

    text.showMessage = function (message, vertical) {
        const settings = state(this.kag);
        const key = scope(this.kag);
        // Covers [p], auto page breaks, and clearing a message layer directly.
        if (!this.kag.getMessageInnerLayer().html()) delete settings.scopes[key];
        const parsed = parseMessage(message, settings.scopes[key] || [], settings.enabled);
        settings.scopes[key] = parsed.stack;
        const previousContext = this.messageHTMLContext;
        const container = document.createElement("span");
        container.appendChild(parsed.fragment);
        this.messageHTMLContext = {
            fragment: container,
            backlog: settings.enabled ? container.innerHTML : escapeHTML(message),
            plain: plainText(container),
        };
        this.kag.stat.current_message_str = this.messageHTMLContext.plain;
        try {
            return original.showMessage.call(this, message, vertical);
        } finally {
            this.messageHTMLContext = previousContext;
        }
    };

    text.buildMessageHTML = function (message, inlineBlock) {
        if (!this.messageHTMLContext) return original.buildMessageHTML.call(this, message, inlineBlock);
        return Array.from(this.messageHTMLContext.fragment.childNodes,
            node => messageHTML(node, this, inlineBlock)).join("");
    };
    text.pushTextToBackLog = function (name, message) {
        return original.pushTextToBackLog.call(this, name,
            this.messageHTMLContext ? this.messageHTMLContext.backlog : message);
    };
    text.speechMessage = function (message) {
        return original.speechMessage.call(this,
            this.messageHTMLContext ? this.messageHTMLContext.plain : message);
    };
    text.addChars = function (message, inner, vertical) {
        // A closing tag or <br> alone has no characters for controlLineBreak().
        if (this.messageHTMLContext && !message.find(".char").length) {
            this.kag.ftag.nextOrder();
            return;
        }
        return original.addChars.call(this, message, inner, vertical);
    };
    text.makeOneCharVisible = function (character) {
        if (character.hasClass("message-html-atom")) {
            character.css({ opacity: 1, visibility: "visible" });
            return;
        }
        return original.makeOneCharVisible.call(this, character);
    };
    text.makeAllCharsVisible = function (characters) {
        characters.filter(".message-html-atom").css({ opacity: 1, visibility: "visible" });
        return original.makeAllCharsVisible.call(this, characters.not(".message-html-atom"));
    };

    for (const name of ["cm", "ct", "er", "p"]) {
        const start = kagDefinition.tag[name].start;
        kagDefinition.tag[name].start = function (pm) {
            if (name === "cm" || name === "ct") state(this.kag).scopes = {};
            else delete state(this.kag).scopes[scope(this.kag)];
            return start.call(this, pm);
        };
    }

    kagDefinition.tag.message_html = {
        pm: { enabled: "true" },
        log_join: "true",
        start: function (pm) {
            state(this.kag).enabled = pm.enabled !== "false";
            state(this.kag).scopes = {};
            this.kag.ftag.nextOrder();
        },
    };
})();
