
<h1>Release notes Mobile Ticket 1.0.0</h1>

----------

<h2>Introduction</h2>

This document describes the new features, bug corrections, known issues and recommendations for Mobile Ticket 1.0.0. If you want to know about connector changes details or similar, this document is for you.

**Note:** Several of the remarks refer to a Jira number (Jira is Qmatic&#39;s internal registration system for bugs), or Pivotal Tracker (internal system for improvements and other issues).

<!--Add new update section after each release

<h2>Version UPDATE_VERSION_NUMBER</h2>

**Date:**
 
**Build number:**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story header** Solution text |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Bug header** Solution text |

<h3>Known issues</h3>

| **Id/Jira** | **Description** |
| --- | --- |
| **xxx** | **Bug header** Bug text |

<h3>Upgrade instructions</h3> 

----------

-->
<h2>Version 26</h2>

**Date:2020-08-17**
 
**Build number:26**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-225** | **MT compatibility issues when test in Firefox** |
| **MOB-226** | **MT compatibility issues when test in Edge browser** |
| **MOB-202** | **MT Application operate as a service** |
| **MOB-151** | **MobileTicket Block in Windows+Safari** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-219** | **Appointment time display bug** |
| **MOB-230** | **Set curser to pointer in service list** |

----------

<h2>Version 25</h2>

**Date:2020-07-17**
 
**Build number:25**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-221** | **Handle API GW newly defined 404 error with message** |
| **MOB-220** | **Loading text on ticket page function implement** |
| **MOB-208** | **Cookie clean up and convert cookie usage to use local storage** |
| **MOB-195** | **Active Cookie consent implemented** |
| **MOB-186** | **Possibility to change the TLS version in the proxy-config.json** |

----------

<h2>Version 24</h2>

**Date:2020-07-17**
 
**Build number:24**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-158** | **Integration with MsTeams for Remote Serving customers in Core** |
| **MOB-175** | **Improve UI, enter of mobile number more intuitive** |
| **MOB-177** | **Introduce extra configurable color to be used for privacy policy link** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-155** | **Mobile Ticket Add Phone Number** |

----------

<h2>Version 23</h2>

**Date:2020-07-01**
 
**Build number:23**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-174** | **Give more attraction to phone number text and button** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-159** | **Notes are gone when checkin appointment** |

----------

<h2>Version 22</h2>

**Date:2020-05-18**
 
**Build number:22**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-138** | **End user flow, enter mobile number feature** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-146** | **If branch is closed for the whole day the Opening hours are shown as "false" bug fixed** |

<h3>Upgrade instructions</h3> 

- New customer data (mobile number) entry feature requires notification module version 4.0.0.49 or above.

----------

<h2>Version 21</h2>

**Date:2020-05-18**
 
**Build number:21**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-137** | **New feature to load appointments through a URL and arrive** |

<h3>Upgrade instructions</h3> 

- New configurations related to appointment arrival needs to be entered in src/config/config.json. You can find the new entries in README.md.
- When configuring "Appointment Confirmation" notification type, below message format should be used.
  ```html
  http://[MOBILE_TICKET_SERVER]/appointment?appId=[publicId]
  ```

----------

<h2>Version 20</h2>

**Date:2020-04-20**
 
**Build number:20** 

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **GP-2624** | **Agent name to be shown when called is now optional** Done from en.json. For example {firstName} is ready to serve you at |

----------

<h2>Version 19</h2>

**Date:2020-01-27**
 
**Build number:19** 

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **169836431** | **Vulnerability: Click jacking - enable/disable MT in iframe** Increase security level in the application using security headers |

----------

<h2>Original release</h2>

**Date:2019-10-11**
 
**Build number:18** 

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story header** Story text |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Bug header** Solution text |

<h3>Known issues</h3>

| **Id/Jira** | **Description** |
| --- | --- |
| **xxx** | **Bug header** Bug text |

<h3>Upgrade Instructions</h3>

----------

<h3>Copyright notice</h3>

The information in this document is subject to change without prior notice and does not represent a commitment on the part of Q-MATIC AB. All efforts have been made to ensure the accuracy of this manual, but Q-MATIC AB cannot assume any responsibility for any errors and their consequences.

This manual is copyrighted and all rights are reserved.
Qmatic and Qmatic Orchestra are registered trademarks or trademarks of Q-MATIC AB.
Reproduction of any part of this manual, in any form, is not allowed, unless written permission is given by Q‑MATIC AB.
COPYRIGHT &copy; Q-MATIC AB, 2020.
