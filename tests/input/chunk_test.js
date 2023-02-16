import {
	c as create_ssr_component,
	f as add_attribute,
	e as escape,
	k as compute_slots,
} from "./index2.js";
const cBaseAppShell = "w-full h-full flex flex-col overflow-hidden";
const cContentArea = "w-full h-full flex overflow-hidden";
const cPage = "flex-1 overflow-x-hidden overflow-y-auto flex flex-col";
const cSidebarLeft = "flex-none overflow-x-hidden overflow-y-auto";
const cSidebarRight = "flex-none overflow-x-hidden overflow-y-auto";
const AppShell = create_ssr_component(
	($$result, $$props, $$bindings, slots) => {
		let classesBase;
		let classesheader;
		let classesSidebarLeft;
		let classesSidebarRight;
		let classesPageHeader;
		let classesPageContent;
		let classesPageFooter;
		let classesFooter;
		let $$slots = compute_slots(slots);
		let { regionPage = "" } = $$props;
		let { slotHeader = "z-10" } = $$props;
		let { slotSidebarLeft = "w-auto" } = $$props;
		let { slotSidebarRight = "w-auto" } = $$props;
		let { slotPageHeader = "" } = $$props;
		let { slotPageContent = "" } = $$props;
		let { slotPageFooter = "" } = $$props;
		let { slotFooter = "" } = $$props;
		if (
			$$props.regionPage === void 0 &&
			$$bindings.regionPage &&
			regionPage !== void 0
		)
			$$bindings.regionPage(regionPage);
		if (
			$$props.slotHeader === void 0 &&
			$$bindings.slotHeader &&
			slotHeader !== void 0
		)
			$$bindings.slotHeader(slotHeader);
		if (
			$$props.slotSidebarLeft === void 0 &&
			$$bindings.slotSidebarLeft &&
			slotSidebarLeft !== void 0
		)
			$$bindings.slotSidebarLeft(slotSidebarLeft);
		if (
			$$props.slotSidebarRight === void 0 &&
			$$bindings.slotSidebarRight &&
			slotSidebarRight !== void 0
		)
			$$bindings.slotSidebarRight(slotSidebarRight);
		if (
			$$props.slotPageHeader === void 0 &&
			$$bindings.slotPageHeader &&
			slotPageHeader !== void 0
		)
			$$bindings.slotPageHeader(slotPageHeader);
		if (
			$$props.slotPageContent === void 0 &&
			$$bindings.slotPageContent &&
			slotPageContent !== void 0
		)
			$$bindings.slotPageContent(slotPageContent);
		if (
			$$props.slotPageFooter === void 0 &&
			$$bindings.slotPageFooter &&
			slotPageFooter !== void 0
		)
			$$bindings.slotPageFooter(slotPageFooter);
		if (
			$$props.slotFooter === void 0 &&
			$$bindings.slotFooter &&
			slotFooter !== void 0
		)
			$$bindings.slotFooter(slotFooter);
		classesBase = `${cBaseAppShell} ${$$props.class ?? ""}`;
		classesheader = `${slotHeader}`;
		classesSidebarLeft = `${cSidebarLeft} ${slotSidebarLeft}`;
		classesSidebarRight = `${cSidebarRight} ${slotSidebarRight}`;
		classesPageHeader = `${slotPageHeader}`;
		classesPageContent = `${slotPageContent}`;
		classesPageFooter = `${slotPageFooter}`;
		classesFooter = `${slotFooter}`;
		return `<div id="${"appShell"}"${add_attribute(
			"class",
			classesBase,
			0
		)} data-testid="${"app-shell"}">
	${
		$$slots.header
			? `<header id="${"shell-header"}" class="${
					"flex-none " + escape(classesheader, true)
			  }">${slots.header ? slots.header({}) : ``}</header>`
			: ``
	}

	
	<div class="${"flex-auto " + escape(cContentArea, true)}">
		${
			$$slots.sidebarLeft
				? `<aside id="${"sidebar-left"}"${add_attribute(
						"class",
						classesSidebarLeft,
						0
				  )}>${slots.sidebarLeft ? slots.sidebarLeft({}) : ``}</aside>`
				: ``
		}

		
		<div id="${"page"}" class="${
			escape(regionPage, true) + " " + escape(cPage, true)
		}">
			${
				$$slots.pageHeader
					? `<header id="${"page-header"}" class="${
							"flex-none " + escape(classesPageHeader, true)
					  }">${
							slots.pageHeader ? slots.pageHeader({}) : `(slot:header)`
					  }</header>`
					: ``
			}

			
			<main id="${"page-content"}" class="${
			"flex-auto " + escape(classesPageContent, true)
		}">${slots.default ? slots.default({}) : ``}</main>

			
			${
				$$slots.pageFooter
					? `<footer id="${"page-footer"}" class="${
							"flex-none " + escape(classesPageFooter, true)
					  }">${
							slots.pageFooter ? slots.pageFooter({}) : `(slot:footer)`
					  }</footer>`
					: ``
			}</div>

		
		${
			$$slots.sidebarRight
				? `<aside id="${"sidebar-right"}"${add_attribute(
						"class",
						classesSidebarRight,
						0
				  )}>${slots.sidebarRight ? slots.sidebarRight({}) : ``}</aside>`
				: ``
		}</div>

	
	${
		$$slots.footer
			? `<footer id="${"shell-footer"}" class="${
					"flex-none " + escape(classesFooter, true)
			  }">${slots.footer ? slots.footer({}) : ``}</footer>`
			: ``
	}</div>`;
	}
);
export { AppShell as A };
