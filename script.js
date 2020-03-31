
onload = function() {
    let curr_data, V, src, dst;
    
    const container = document.getElementById('mynetwork');
    const container2 = document.getElementById('mynetwork2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');
    const temptext = document.getElementById('temptext');
    const temptext2 = document.getElementById('temptext2');
    const cities = ['Delhi', 'Mumbai', 'Gujarat', 'Goa', 'Kanpur', 'Jammu', 'Hyderabad', 'Bangalore', 'Gangtok', 'Meghalaya'];

    //initialise graph options
    const options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },
        nodes: {
            font: '12 px arial red',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf015',
                size: 40,
                color: '#991133'
            }
        }
    };
    //initialise your network!
    //Network for question graph
    const network = new vis.Network(container);
    network.setOptions(options);
    //Network for solution graph
    const network2 = new vis.Network(container2);
    network2.setOptions(options);

    function createData() {
        V = Math.floor(Math.random() * (cities.length-2)) + 3;    // Ensures V is between 3 and 10
        let nodes = [];
        for(let i=1;i<=V;i++){
            nodes.push({id: i, label: cities[i-1]});
        }
        nodes = new vis.DataSet(nodes);        // Prepares vis.js style nodes for our data

        // Creating a tree like underlying graph structure
        let edges = [];
        for(let i=2;i<=V;i++){
            let neigh = i - Math.floor(Math.random() * Math.min(3,i-1) + 1);  // Picks a neighbour from i-3 to i-1
            edges.push({type: 0, from: i, to: neigh, color: 'orange', label: String(Math.floor(Math.random()*70) + 31)});
        }
        
        // Randomly adding new edges to graph
        // Type of bus is 0
        // Type of plane is 1
        for(let k=1;k<=V/2;){
            let n1 = Math.ceil(Math.random()*V);
            let n2 = Math.ceil(Math.random()*V);
            
            if(n1!=n2){
                if(n1<n2){
                    let temp=n1;
                    n1=n2;
                    n2=temp;
                }
                // Seeing if an edge between these two vertices already exists
                // And if it does then of which kind
                let works=0;
                for(let i=0;i<edges.length;i++){
                    if(edges[i]['from']==n1 && edges[i]['to']==n2){
                        if(edges[i]['type']==0){
                            works=1;
                        }
                        else{
                            works=2;
                        }
                    }
                }
                          
                // Adding edges to the graph
                // If works == 0, you can add bus as well as plane between vertices
                // If works == 1, you can only add plane between them
                if(works<=1){
                    if(works==0 && k<V/4){
                        // Adding a bus
                        edges.push({type: 0, from: n1, to: n2, color: 'orange', label: String(Math.floor(Math.random()*70) + 31)});
                    }
                    else{
                        // Adding a plane
                        edges.push({type: 1, from: n1, to: n2, color: 'green', label: String(Math.floor(Math.random()*50) + 1)});
                    }
                    k++;
                }
            }
        }

        // Setting the new values of global variables
        src = 1;
        dst = V;
        curr_data = {
            nodes: nodes,
            edges: edges
        };
    }

    genNew.onclick = function () {
        // Create new data and display the data
        createData();
        network.setData(curr_data);
        temptext2.innerText = 'Find least time path from '+cities[src-1]+' to '+cities[dst-1];
        temptext.style.display = "inline";
        temptext2.style.display = "inline";
        container2.style.display = "none";
    };

    solve.onclick = function () {
        // Create graph from data and set to display
        temptext.style.display  = "none";
        temptext2.style.display  = "none";
        container2.style.display = "inline";
        network2.setData(solveData());
    };

    function dijkstras(adjList, V, src){
        let vis = Array(V).fill(false);
        let dist = [];
        for(let i=0;i<V;i++){
            dist.push([10000,-1]);
        }    
        dist[src][0]=0;
        
        for(let k=0;k<V;k++){
            let mn = -1;
    
            for(let i=0;i<V;i++){
                if(vis[i]==false){
                    if(mn==-1 || dist[i][0] < dist[mn][0]){
                        mn = i;
                    }
                }
            }
    
            vis[mn] = true;
    
            for(let i=0;i<adjList[mn].length;i++){
                let edge = adjList[mn][i];
    
                if(vis[edge[0]]==false){
                    if(dist[mn][0] + edge[1] < dist[edge[0]][0]){
                        dist[edge[0]][0] = dist[mn][0] + edge[1]; //distance from source
                        dist[edge[0]][1] = mn; //parent
                    }
                }
            }
        }
    
        return dist;
    }

    function createGraph(data){
        let adjList = [];
    
        for(let i=1;i<=V;i++){
            adjList.push([]);
        }
    
        for(let i=0;i<data['edges'].length;i++){
            let edge = data['edges'][i];
            if(edge['type']==1){
                continue;
            }
            adjList[edge['from']-1].push([ edge['to']-1, parseInt(edge['label']) ]);
            adjList[edge['to']-1].push([ edge['from']-1, parseInt(edge['label']) ]);
        }
        
        return adjList;
    }

    function shouldTakePlane(edges, dist1, dist2, mnDist){
        let plane = 0;
        let p1=-1, p2=-1;

        for(let pos in edges){
            let edge = edges[pos];

            if(edge['type']==1){
                let from = edge['from']-1;
                let to = edge['to']-1;
                let wgt = parseInt(edge['label']); //weight of edge

                if(dist1[from][0] + wgt + dist2[to][0] < mnDist){
                    mnDist = dist1[from][0] + wgt + dist2[to][0];
                    plane = wgt;
                    p1 = from; 
                    p2 = to;
                }

                if(dist1[to][0] + wgt + dist2[from][0] < mnDist){
                    mnDist = dist1[to][0] + wgt + dist2[from][0];
                    plane = wgt;
                    p1 = to; 
                    p2 = from;
                }
            }
        }

        return {plane, p1, p2};
    }

    function solveData(){
        const data = curr_data;
        
        // Creating adjacency list matrix graph from question data
        const adjList = createGraph(data);
        
        // Applying djikstra from src and dst
        let dist1 = dijkstras(adjList,V,src-1);
        let dist2 = dijkstras(adjList,V,dst-1);
        
        // Initialise min_dist to min distance via bus from src to dst
        let mnDist = dist1[dst-1][0];

        // See if plane should be used
        let {plane,p1,p2} = shouldTakePlane(data['edges'],dist1,dist2,mnDist);

        let newEdges = [];

        if(plane==0){
            newEdges.push(...pushEdges(dist1,dst-1,false));
        }
        else{
            newEdges.push({arrows: { to: { enabled: true}}, from: p1+1, to: p2+1, color: 'green',label: String(plane)});
            // Using spread operator to push elements of result of pushEdges to new_edges
            newEdges.push(...pushEdges(dist1, p1, false));
            newEdges.push(...pushEdges(dist2, p2, true));
        }

        const ansData = {
            nodes: data['nodes'],
            edges: newEdges
        }

        return ansData;
    }

    function pushEdges(dist, curr, reverse){
        let tmp_edges = [];
        while(dist[curr][0]!==0){
            let parent = dist[curr][1];
            if(reverse==true)
                tmp_edges.push({arrows: { to: { enabled: true}},from: curr+1, to: parent+1, color: 'orange', label: String(dist[curr][0] - dist[parent][0])});
            else
                tmp_edges.push({arrows: { to: { enabled: true}},from: parent+1, to: curr+1, color: 'orange', label: String(dist[curr][0] - dist[parent][0])});
            curr = parent;
        }
        return tmp_edges;
    }

    genNew.click();
};

