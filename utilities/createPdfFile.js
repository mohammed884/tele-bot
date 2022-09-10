import pdf from "pdf-creator-node";
import path from "path"
const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title></title>
            </head>
            <body>
                <div style="width:90%; padding:.3em; margin-left:auto; margin-right:auto;">
                    <h1 style="width:fit-content;margin-left:auto; margin-right:auto;">Out of Stock Products</h1>
                    <ul style="list-style:decimal;">
                        {{#each products}}
                            <li>
                                <span>{{this.title}}</span>
                                <input type="checkbox">
                            </li>
                            <br />
                        {{/each}}
                    </ul>
                </div>
            </body>
        </html>
`;
const pdfOptions = {
    format: "A3",
    orientation: "portrait",
    header: {
        height: "45mm",
        contents: ''
    },
    footer: {
        height: "28mm",
        contents: {
            first: '<span style="width:90% margin-left:auto; margin-right:auto">page 1</span>',
            2: 'Second page', // Any page number is working. 1-based index
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            last: '<span>Developed By Mohammed Abdulaziz ©</span>'
        }
    }
};
const createPdfFile = (products) => {
    const document = {
        html,
        data: {
            products,
        },
        path: "./public/pdfs/output.pdf",
        type: "",
    };
    pdf.create(document, pdfOptions)
        .then((res) => {
            console.log(res);
        })
        .catch((error) => {
            console.error(error);
        });
    return `${path.resolve()}/public/pdfs/output.pdf`
};
export default createPdfFile