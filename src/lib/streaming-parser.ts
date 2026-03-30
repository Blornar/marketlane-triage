import { SSEEvent, ExtractedField } from "./types";

/**
 * Incremental JSON parser that emits SSE events as sections of the triage
 * response are completed. Tracks brace/bracket depth and detects when
 * top-level keys' values finish, enabling field-by-field streaming for
 * extracted_fields and section-level events for other keys.
 */
export class StreamingJsonParser {
  private buffer = "";
  private rootFound = false;
  private depth = 0;
  private inString = false;
  private escapeNext = false;
  private currentTopKey = "";
  private topKeyBuffer = "";
  private valueStartIndex = -1;
  private events: SSEEvent[] = [];

  // For field-by-field extraction within extracted_fields
  private inExtractedFields = false;
  private currentFieldKey = "";
  private fieldKeyBuffer = "";
  private fieldValueStart = -1;
  private readingFieldKey = false;
  private fieldKeyComplete = false;

  feed(chunk: string): SSEEvent[] {
    this.events = [];

    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];
      this.buffer += char;

      if (this.escapeNext) {
        this.escapeNext = false;
        continue;
      }

      if (char === "\\" && this.inString) {
        this.escapeNext = true;
        continue;
      }

      if (char === '"' && !this.escapeNext) {
        this.inString = !this.inString;

        if (!this.rootFound) continue;

        // Track top-level key reading (depth 1, reading a key before the colon)
        if (this.depth === 1 && this.valueStartIndex === -1) {
          if (this.inString && this.currentTopKey === "") {
            // Opening quote of a new top-level key
            this.topKeyBuffer = "";
          } else if (!this.inString && this.currentTopKey === "") {
            // Closing quote — we have the key name
            this.currentTopKey = this.topKeyBuffer;
          }
        }

        // Track field key within extracted_fields (depth 2)
        if (this.inExtractedFields && this.depth === 2 && this.fieldValueStart === -1) {
          if (this.inString && !this.readingFieldKey && !this.fieldKeyComplete) {
            this.readingFieldKey = true;
            this.fieldKeyBuffer = "";
          } else if (!this.inString && this.readingFieldKey) {
            this.readingFieldKey = false;
            this.currentFieldKey = this.fieldKeyBuffer;
            this.fieldKeyComplete = true;
          }
        }

        continue;
      }

      if (this.inString) {
        // Accumulate key characters
        if (this.depth === 1 && this.currentTopKey === "" && this.valueStartIndex === -1) {
          this.topKeyBuffer += char;
        }
        if (this.inExtractedFields && this.readingFieldKey) {
          this.fieldKeyBuffer += char;
        }
        continue;
      }

      // Not in a string
      if (char === "{" || char === "[") {
        if (!this.rootFound && char === "{") {
          this.rootFound = true;
          this.depth = 1;
          continue;
        }
        this.depth++;

        // Mark start of a top-level section value
        if (this.depth === 2 && this.currentTopKey !== "" && this.valueStartIndex === -1) {
          this.valueStartIndex = this.buffer.length - 1;
          if (this.currentTopKey === "extracted_fields") {
            this.inExtractedFields = true;
          }
        }

        // Mark start of a field value within extracted_fields
        if (this.inExtractedFields && this.depth === 3 && this.fieldKeyComplete) {
          this.fieldValueStart = this.buffer.length - 1;
        }
      } else if (char === "}" || char === "]") {
        this.depth--;

        // A field value object within extracted_fields just closed (depth went from 3 to 2)
        if (this.inExtractedFields && this.depth === 2 && this.currentFieldKey && this.fieldValueStart !== -1) {
          const fieldJson = this.buffer.substring(this.fieldValueStart, this.buffer.length);
          try {
            const fieldData = JSON.parse(fieldJson) as ExtractedField;
            this.events.push({
              type: "field",
              name: this.currentFieldKey,
              field: fieldData,
            });
          } catch {
            // Partial or malformed field, skip
          }
          this.currentFieldKey = "";
          this.fieldKeyBuffer = "";
          this.fieldValueStart = -1;
          this.fieldKeyComplete = false;
        }

        // A top-level section value just closed (depth went from 2 to 1)
        if (this.depth === 1 && this.currentTopKey !== "" && this.valueStartIndex !== -1) {
          const sectionJson = this.buffer.substring(this.valueStartIndex, this.buffer.length);
          this.emitSection(this.currentTopKey, sectionJson);
          this.currentTopKey = "";
          this.topKeyBuffer = "";
          this.valueStartIndex = -1;
          this.inExtractedFields = false;
        }

        // Root object closed
        if (this.depth === 0) {
          // Done
        }
      } else if (char === "," && this.depth === 1) {
        // Reset for next top-level key
        this.currentTopKey = "";
        this.topKeyBuffer = "";
        this.valueStartIndex = -1;
      } else if (char === "," && this.inExtractedFields && this.depth === 2) {
        // Reset for next field
        this.currentFieldKey = "";
        this.fieldKeyBuffer = "";
        this.fieldValueStart = -1;
        this.fieldKeyComplete = false;
        this.readingFieldKey = false;
      }
    }

    return this.events;
  }

  private emitSection(key: string, json: string) {
    try {
      const data = JSON.parse(json);
      switch (key) {
        case "extracted_fields":
          // Fields were already emitted individually
          break;
        case "missing_fields":
          this.events.push({ type: "missing_fields", data });
          break;
        case "brand_routing":
          this.events.push({ type: "brand_routing", data });
          break;
        case "risk_assessment":
          this.events.push({ type: "risk_assessment", data });
          break;
        case "loss_scenarios":
          this.events.push({ type: "loss_scenarios", data });
          break;
        case "completeness_score":
          this.events.push({ type: "completeness_score", data });
          break;
        case "policy_recommendations":
          this.events.push({ type: "policy_recommendations", data });
          break;
        case "metadata":
          this.events.push({ type: "metadata", data });
          break;
      }
    } catch {
      // Failed to parse section — will fall back to getFullResult
    }
  }

  /**
   * Attempt to parse the full accumulated buffer as complete JSON.
   * Used as a fallback if streaming parsing missed events.
   */
  getFullResult(): Record<string, unknown> | null {
    const start = this.buffer.indexOf("{");
    const end = this.buffer.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;

    try {
      return JSON.parse(this.buffer.substring(start, end + 1));
    } catch {
      return null;
    }
  }
}
