// terrain.js
// used to generate the terrain
//

function generateTerrainMesh(width, height, amplitude, resolution)
{
    let vertices = [];
    let normals = [];
    let uvs = [];
    let vertexIndices = [];
    let normalIndices = [];
    let uvIndices = [];

    // add the vertices
    for (let i = 0; i < width; i++)
    {
        for (let j = 0; j < height; j++)
        {
            let x = i - width / 2;
            let z = j - height / 2;
            let y = Math.sin(x / resolution) * Math.cos(z / resolution) * amplitude;
            vertices.push(new Vector3([x, y, z]));
            uvs.push(new Vector3([i / width, j / height, 0]));
        }
    }

    // now calculate the normals
    for (let i = 0; i < width; i++)
    {
        for (let j = 0; j < height; j++)
        {
            let v1 = i * height + j;
            let v2 = i * height + j + 1;
            let v3 = (i + 1) * height + j;
            let v4 = (i + 1) * height + j + 1;

            let normal = new Vector3([0, 0, 0]);
            if (i > 0 && j > 0 && i < width - 1 && j < height - 1)
            {
                let normal1 = vertices[v1].sub(vertices[v2]).cross(vertices[v1].sub(vertices[v3]));
                let normal2 = vertices[v2].sub(vertices[v4]).cross(vertices[v2].sub(vertices[v3]));
                normal = normal1.add(normal2);
                normal = normal.normalize();
            }
            else
            {
                normal = new Vector3([0, 1, 0]);
            }
            normals.push(normal);
        }
    }

    // now organize the vertices into triangles
    for (let i = 0; i < width - 1; i++)
    {
        for (let j = 0; j < height - 1; j++)
        {
            let v1 = i * height + j;
            let v2 = i * height + j + 1;
            let v3 = (i + 1) * height + j;
            let v4 = (i + 1) * height + j + 1;

            // triangle 1
            vertexIndices.push(v1);
            vertexIndices.push(v2);
            vertexIndices.push(v3);

            // triangle 2
            vertexIndices.push(v2);
            vertexIndices.push(v4);
            vertexIndices.push(v3);

            // normals
            normalIndices.push(v1);
            normalIndices.push(v2);
            normalIndices.push(v3);
            normalIndices.push(v2);
            normalIndices.push(v4);
            normalIndices.push(v3);

            // uvs
            uvIndices.push(v1);
            uvIndices.push(v2);
            uvIndices.push(v3);
            uvIndices.push(v2);
            uvIndices.push(v4);
            uvIndices.push(v3);
        }
    }

    return new Mesh(vertices, normals, uvs, vertexIndices, normalIndices, uvIndices);
}