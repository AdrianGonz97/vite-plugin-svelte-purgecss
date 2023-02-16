import { describe, it, expect } from "vitest";
import {
	extractSelectorsFromHtml,
	extractSelectorsFromJS,
	extractSelectorsFromSvelte,
} from "../src/extractors";
import { readFile } from "fs/promises";
import { preprocess } from "svelte/compiler";
import sveltePreprocess from "svelte-preprocess";
import type { typescript as TS } from "svelte-preprocess";

describe("extractSelectorsWithRegex", () => {
	it("html", async () => {
		const source = await readFile("tests/input/test.html", "utf-8");
		const selectors = extractSelectorsFromHtml(source);
		const ans = [
			"#app",
			".dark",
			".skeleton",
			".data-theme",
			".h-full",
			".overflow-hidden",
			"html",
			"head",
			"meta",
			"link",
			"body",
			"div",
		];

		expect(selectors).toMatchObject(ans);
	});

	it("js chunks", async () => {
		const source = await readFile("tests/input/chunk_test.js", "utf-8");
		const selectors = extractSelectorsFromJS(source);
		const ans = [
			"./index2.js",
			".w-full",
			".h-full",
			".flex",
			".flex-col",
			".overflow-hidden",
			".flex-1",
			".overflow-x-hidden",
			".overflow-y-auto",
			".flex-none",
			".z-10",
			".w-auto",
			".appShell",
			".class",
			".app-shell",
			".shell-header",
			".flex-auto",
			".sidebar-left",
			".page",
			".page-header",
			".page-content",
			".page-footer",
			".sidebar-right",
			".shell-footer",
		];
		expect(selectors).toMatchObject(ans);
	});

	it("js menu", async () => {
		const source = await readFile("tests/input/normal_test.js", "utf-8");
		const selectors = extractSelectorsFromJS(source);
		const ans = [
			".a[href],",
			".button,",
			".input,",
			".textarea,",
			".select,",
			".details,",
			'.[tabindex]:not([tabindex="-1"])',
			".role",
			".menu",
			".block",
			".none",
			".hidden",
			".t",
			".b",
			".l",
			".r",
			".menu-tl",
			".menu-tr",
			".menu-bl",
			".menu-br",
			".Enter",
			".Space",
			".Escape",
			".Tab",
			".ArrowDown",
			".ArrowUp",
			".resize",
			".click",
			".keydown",
			".change",
		];
		expect(selectors).toMatchObject(ans);
	});

	it("svelte", async () => {
		const path = "tests/input/test.svelte";
		const source = await readFile(path, "utf-8");
		// @ts-expect-error extract the preprocessors for ts and postcss
		const { typescript } = sveltePreprocess as {
			typescript: typeof TS;
		};

		const result = await preprocess(source, [typescript()], { filename: path });
		const selectors = extractSelectorsFromSvelte(result.code, path);
		const ans = [
			"div",
			".paginator",
			".class",
			".data-testid",
			"label",
			".paginator-label",
			".select",
			".paginator-select",
			".aria-label",
			".Select",
			"option",
			"span",
			".paginator-details",
			".opacity-50",
			"strong",
			".paginator-arrows",
			"button",
			".btn-icon",
			".svelte",
			".min-w-[150px]",
			".justify-between",
			".text-xs",
			".variant-filled",
			".&larr;",
			".&rarr;",
			".flex",
			".flex-col",
			".md:flex-row",
			".items-center",
			".space-y-4",
			".md:space-y-0",
			".md:space-x-4",
			".w-full",
			".md:w-auto",
			".whitespace-nowrap",
			".amount",
			".page",
		];
		expect(selectors).toMatchObject(ans);
	});
});
