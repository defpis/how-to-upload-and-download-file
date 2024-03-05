import { ReactElement, cloneElement, useState } from "react";
import "./App.css";
import axios from "axios";

async function handleDownload({
  path,
  filename,
  callbacks,
}: {
  path: string;
  filename?: string;
  callbacks?: {
    start?: () => void;
    end?: () => void;
  };
}) {
  try {
    callbacks?.start?.();

    const { data, headers } = await axios.get(path, {
      responseType: "blob",
    });
    const blob = new Blob([data], { type: headers["content-type"] });
    const href = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = href;
    a.download = filename || "untitled";
    a.style.display = "none";
    a.click();

    URL.revokeObjectURL(href);
    a.remove();
  } catch (err) {
    console.error(err);
  } finally {
    callbacks?.end?.();
  }
}

function Download(props: { children: ReactElement; [k: string]: any }) {
  const { path, filename, children, ...rest } = props;

  const [loading, setLoading] = useState(false);

  const renderNode = cloneElement(children, {
    ...(path
      ? {
          onClick: () =>
            handleDownload({
              path,
              filename,
              callbacks: {
                start: () => setLoading(true),
                end: () => setLoading(false),
              },
            }),
          loading,
        }
      : {}),
    ...rest,
  });

  return renderNode;
}

function handleUpload({
  path,
  accept,
  callbacks,
}: {
  path: string;
  accept?: string;
  callbacks?: {
    start?: () => void;
    end?: () => void;
  };
}) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept || "";
  input.style.display = "none";
  input.click();

  const upload = async () => {
    if (input.files?.length) {
      const file = input.files[0];

      const formData = new FormData();
      formData.append("file", file);

      try {
        callbacks?.start?.();
        await axios.post(path, formData);
      } catch (err) {
        console.error(err);
      } finally {
        callbacks?.end?.();
      }
    }

    input.removeEventListener("change", upload);
    input.remove();
  };
  input.addEventListener("change", upload);
}

function Upload(props: { children: ReactElement; [k: string]: any }) {
  const { path, accept, children, ...rest } = props;

  const [loading, setLoading] = useState(false);

  const renderNode = cloneElement(children, {
    ...(path
      ? {
          onClick: () =>
            handleUpload({
              path,
              accept,
              callbacks: {
                start: () => setLoading(true),
                end: () => setLoading(false),
              },
            }),
          loading,
        }
      : {}),
    ...rest,
  });

  return renderNode;
}

function Button(props: any) {
  const { loading, children, ...rest } = props;

  return (
    <>
      <button disabled={loading} {...rest}>
        {children}
        {loading && "加载中..."}
      </button>
    </>
  );
}

function App() {
  return (
    <>
      <h1>Hello World!</h1>

      <Download path="/api/download/hello.txt">
        <Button>下载文件</Button>
      </Download>

      <Upload path="/api/upload">
        <Button>上传文件</Button>
      </Upload>
    </>
  );
}

export default App;
