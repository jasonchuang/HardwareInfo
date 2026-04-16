import SwiftUI
import MarkdownUI

struct ContentView: View {
    @StateObject private var viewModel = MarkdownViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Toolbar
            HStack {
                Button("Open File") { viewModel.openFile() }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)

                if let name = viewModel.fileName {
                    Text(name)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }

                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.bar)

            Divider()

            // Content area
            if let markdownText = viewModel.markdownText {
                ScrollView {
                    Markdown(markdownText)
                        .markdownTheme(.gitHub)
                        .padding(32)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            } else {
                // Drop zone / empty state
                DropZoneView()
                    .onDrop(of: [.fileURL], isTargeted: nil) { providers in
                        viewModel.handleDrop(providers: providers)
                    }
            }
        }
        .frame(minWidth: 500, minHeight: 400)
        .onReceive(NotificationCenter.default.publisher(for: .openFileRequested)) { _ in
            viewModel.openFile()
        }
        .onDrop(of: [.fileURL], isTargeted: nil) { providers in
            viewModel.handleDrop(providers: providers)
        }
    }
}

// MARK: - Drop Zone

struct DropZoneView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text")
                .font(.system(size: 56))
                .foregroundStyle(.tertiary)
            Text("Drag a .md file here")
                .font(.title3)
                .foregroundStyle(.secondary)
            Text("or use File → Open…  (⌘O)")
                .font(.callout)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Preview

#Preview {
    ContentView()
}
