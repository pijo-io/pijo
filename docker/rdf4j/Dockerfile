FROM eclipse/rdf4j-workbench

ENV JAVA_OPTS="-Xmx2g"
ENV CATALINA_OPTS="-Dorg.eclipse.rdf4j.appdata.basedir=/var/rdf4j"

RUN adduser -S tomcat
USER tomcat

RUN	cp wars/*.war /usr/local/tomcat/webapps
RUN	chown -R tomcat /var/rdf4j /usr/local/tomcat
RUN	chmod a+x /usr/local/tomcat /usr/local/tomcat/bin /usr/local/tomcat/bin/catalina.sh

WORKDIR /usr/local/tomcat/

# COPY web.xml conf/web.xml

EXPOSE 8080
