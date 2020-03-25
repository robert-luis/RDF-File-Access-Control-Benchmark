## Benchmark for Graph Based Access Control for RDF Files ##

### The Access Control Framework

### The Benchmark

#### Benchmark Setup

    - Modifyable parameters
        - Data set:
                - Pods: Number of Pods in each data set
                - Posts: Number of posts in each pod
                - Authentications: Category which can be set to 1, 2, or 3. Describes whether (1) access is only granted to one named graph of the profile document (the card), (2) access is granted to two named graphs (the card and the private microblog), or (3) access is granted to all three named graphs (the card and the private and public microblogs)

    *Note: each pod contains only two documents: the profile and the access control document. Hence, all posts are stored in the profile document.*

#### Benchmark Initialisation

    - Set the data set parameters in config.json
    - Execute runServer.sh
    - Execute runBM.sh in a second terminal
  