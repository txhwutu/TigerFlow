TigerFlow: Service Based Flow Shop Simulator
============================================

The TigerFlow simulator is a service based platform for simulating
flow-shops composed of machines and automated guided vehicle (AGVs). In
a TigerFlow’ flow shop machines execute a collection of tasks in order
to complete a job and AGVs move material from one machine to another for
completing a task. In the current version of TigerFlow tasks are
assigned to machines randomly. However, in the presence of machine
failures, tasks are reallocated to other machines following a best
effort approach.

The guide is structured as follows:

-   Running TigerFlow

-   Configuring a flow shop

-   Scheduling a machine tasks

-   Overcoming failures

TigerFlow dependencies
----------------------

-   Windows

-   NodeJS

Running TigerFlow
-----------------

The TigerFlow platform is started by executing the following script in
folder TIGERFLOW:

\$ node bin/www.js

In TigerFlow entities communicate by exchanging messages over a network
(cf. figure below).

![](media/image1.png){width="4.18125in" height="2.0844291338582677in"}

When TigerFlow is initialized it starts the following services (cf.
image below):

-   **Network**: responsible of broadcasting flow shop messages.[^1]

-   **Cell**: in charge of allocating tasks in machines.

-   **Warehouse**: responsible of dispatching AGVs to machines carrying
    material for task execution.

![](media/image2.png){width="7.052083333333333in"
height="2.1041666666666665in"}

![](media/image3.png){width="7.052083333333333in"
height="1.7708333333333333in"}

![](media/image4.png){width="7.052083333333333in"
height="1.7708333333333333in"}

Configuring a flow shop
-----------------------

TigerFlow offers a Web UI for configuring a flow shop
([*localhost:3000*](http://localhost:3000)). The interface offers
buttons for adding n machines/AGVs to a flow shop (cf. figure below).

![](media/image5.png){width="7.268055555555556in"
height="2.8041666666666667in"} When a user adds an AGV to a flow shop,
TigerFlow creates an AGV service instance and add it to the network.
This can be seen in the Web UI in the log panel. In the same way, if a
user adds a machine to a flow shop, TigerFlow creates a *machine service
instance* with 10 randomly tasks (executed one at a time) and add it to
the network.

The following images show the state of the flow shop after adding 2
machines and 1 AGVs to the flow shop.

![](media/image6.png){width="7.268055555555556in"
height="8.36111111111111in"}

![](media/image7.png){width="7.052083333333333in"
height="1.2708333333333333in"}

> ![](media/image8.png){width="7.052083333333333in"
> height="3.1041666666666665in"}
>
> ![](media/image9.png){width="7.052083333333333in"
> height="2.1041666666666665in"}
> ![](media/image10.png){width="7.052083333333333in"
> height="3.6041666666666665in"}
>
> ![](media/image11.png){width="7.052083333333333in"
> height="3.6041666666666665in"}

Scheduling machine tasks
------------------------

Machine tasks have each an *ID*, an *estimated processing time*, an
*estimated completion time* and a *due date*. They can also be in one of
three states at runtime: waiting, executing or executed state. You can
follow the progress of a task in the Web UI.

When a new job comes, it can be submitted in the ‘add new job’ panel. If
the checkbox is selected, the job will be a rush order. Otherwise the
job will be a normal job with a very large due date and the due date
setting will not work. Rush order means a job’s completion time should
be earlier than due date or close to due date as much as possible.
Obviously, normal jobs will be add to the end of task queue.

The following images show the state of the flow shop after submitting a
rush order.

![](media/image12.png){width="7.268055555555556in"
height="8.606944444444444in"}

![](media/image13.png){width="7.052083333333333in"
height="1.6041666666666667in"}

![](media/image14.png){width="7.052083333333333in"
height="1.2708333333333333in"}

![](media/image15.png){width="7.052083333333333in"
height="1.6041666666666667in"}

![](media/image16.png){width="7.052083333333333in"
height="1.7708333333333333in"}

![](media/image17.png){width="7.052083333333333in" height="1.4375in"}

When a job’s due date is changed ,you can use ‘modify job’ panel to
modify the job’s due date. If the job matches the delay condition that
due date is one minute later than estimated completion time, the job
will be rescheduled.

The following images show the state of the flow shop after modifying a
job.

![](media/image18.png){width="7.268055555555556in"
height="5.622222222222222in"}

![](media/image19.png){width="7.052083333333333in"
height="1.2708333333333333in"}

![](media/image20.png){width="7.052083333333333in" height="1.4375in"}

![](media/image21.png){width="7.052083333333333in" height="1.9375in"}

![](media/image22.png){width="7.052083333333333in"
height="1.2708333333333333in"}

Overcoming machine failures
---------------------------

When one machine is out of action, all tasks in its task queue will be
allocated to other machines. You can simulate machine failure with
‘close machine’ panel by closing a certain machine.

The following images show the state of the flow shop after a machine
failure. ![](media/image23.png){width="7.268055555555556in"
height="6.957638888888889in"}

![](media/image24.png){width="7.052083333333333in" height="3.9375in"}
![](media/image25.png){width="7.052083333333333in" height="1.9375in"}

![](media/image26.png){width="7.052083333333333in"
height="4.104166666666667in"}
![](media/image27.png){width="7.052083333333333in" height="3.9375in"}

[^1]: In its current version, TigerFlow simulates a CAN bus network.
